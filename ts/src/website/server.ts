import express from "express"
import DiscordOAuth2 from "discord-oauth2"
import jwt from "jsonwebtoken"
import CookieParser from "cookie-parser"
import { client } from "../../main.js"

client.log(
    {
        color: "yellow",
        content: "a carregar",
        shardId: client.shardId,
        name: "website"
    }
)

const app = express()

app.enable("trust proxy")
app.set("etag", false)
app.use(CookieParser())

const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const jwtSecret = process.env.JWT_SECRET

let baseUrl = process.env.URL

const port = 24012

if (process.env.ENVIRONMENT === "dev") {
    baseUrl = "http://localhost:" + port
} else {
    baseUrl = baseUrl + `:${port}`
}

const oauth2 = new DiscordOAuth2(
    {
        clientId,
        clientSecret,
        redirectUri: baseUrl + "/callback"
    }
)

app.get("/", async (req, res) => {

    console.log("Entrou /")

    if (!req.cookies.token) {
        return res.redirect("/login")
    }

    let decoded;

    try {
        decoded = jwt.verify(req.cookies.token, jwtSecret)
    } catch (err) {
        return res.redirect("/login")
    }

    if (!decoded) {
        return res.redirect("/login")
    }

    const data = await client.db.findWebData(
        {
            _id: decoded.userId
        }
    )

    await fetch(`https://discord.com/api/guilds/1133531362419281940/members/${decoded.userId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bot ${process.env.DISCORD_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ "access_token": data.access_token })
    }).then(res => res)

    res.status(200).send("<h1> Acabou / </h1>")
})

app.get("/login", async (req, res) => {

    console.log("Entrou login")

    const url = oauth2.generateAuthUrl(
        {
            scope: ["identify", "guilds.join"]
        }
    )

    if (req.cookies.token && req.cookies.token.length > 0) {

        let decoded;

        try {
            decoded = jwt.verify(req.cookies.token, jwtSecret)
        } catch (err) {
            return res.redirect("/login")
        }

        if (!decoded) {
            return res.redirect("/login")
        }

        const data = await client.db.findWebData(
            {
                _id: decoded.userId
            },
            true
        )

        if (Date.now() > data.expires_in * 1000) {
            const OAuthData = await oauth2.tokenRequest(
                {
                    refreshToken: data.refresh_token,
                    grantType: "refresh_token",
                    scope: ["identify", "guilds.join"]
                }
            )

            await client.db.updateWebData(
                {
                    _id: decoded.userId
                },
                {
                    $set: {
                        "access_token": OAuthData.access_token,
                        "expires_in": OAuthData.expires_in,
                        "refresh_token": OAuthData.refresh_token
                    }
                }
            )
        }  
        
        return res.redirect("/")
        
    } else {
        return res.redirect(url)
    }
})

app.get("/callback", async (req, res) => {

    console.log("Entrou callback")

    const code = req.query.code

    if (!code) {
        return res.redirect("/login")
    }

    let OAuthData: DiscordOAuth2.TokenRequestResult;

    try {
        OAuthData = await oauth2.tokenRequest(
            {
                code: req.query.code as string,
                grantType: "authorization_code",
                scope: ["identify", "guilds.join"]
            }
        )
    } catch (e) {
        return res.redirect("/login")
    }

    if (!OAuthData) {
        return res.redirect("/login")
    }

    const user = await oauth2.getUser(OAuthData.access_token)

    await client.db.findWebData(
        {
            _id: user.id
        },
        true
    )

    const secretAccessKey = jwt.sign(
        {
            userId: user.id
        },
        jwtSecret
    )

    await client.db.updateWebData(
        {
            _id: user.id
        },
        {
            $set: {
                access_token: OAuthData.access_token,
                expires_in: OAuthData.expires_in,
                refresh_token: OAuthData.refresh_token,
                secretAccessKey: secretAccessKey
            }
        }
    )

    await fetch(`https://discord.com/api/v10/guilds/1133531362419281940/members/${user.id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bot ${process.env.DISCORD_TOKEN_CANARY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ "access_token": OAuthData.access_token })
    }).then(res => res)

    res.cookie("token", secretAccessKey, { maxAge: 10000 })
    res.redirect("/")
})

app.listen(port, () => {
    client.log(
        {
            color: "green",
            content: `Online em ${baseUrl}`,
            shardId: client.shardId,
            name: "website"
        }
    )
})