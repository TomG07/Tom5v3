import { Job, JobCallback, scheduleJob, Spec } from "node-schedule";

export default class ScheduleJob {

    spec: Spec
    callback: JobCallback
    actualJob: Job

    constructor(spec: Spec, callback: JobCallback) {
        this.spec = spec
        this.callback = callback
    }

    start() {
        this.actualJob = scheduleJob(this.spec, this.callback)

        return
    }

    cancel() {
        this.actualJob.cancel()

        return
    }
}