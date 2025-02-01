interface Event {
    name: string;
    effect: number;
    type?: "positive" | "negative" | "neutral";
}

interface Probabilities {
    positive: number;
    negative: number;
    neutral: number;
}

interface EventsData {
    names: Event[];
    probabilities: Probabilities;
}

export {
    Event,
    Probabilities,
    EventsData
}