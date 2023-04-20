import * as bcrypt from "bcryptjs";
import Redis from "ioredis";
import superjson from "superjson";
import { v4 as uuid } from "uuid";

// Can't extend here because we have some specifics that are non-existent on EventEmitter
export class RedisEventEmitter {
  redis: Redis;
  map = new Map<string, boolean>();
  eventToID: {
    [event: string]: string[] | undefined;
  } = {};
  idToListener: {
    [id: string]: ((...args: any[]) => any) | undefined;
  } = {};
  subscribed = false;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  subscribeMessage() {
    this.subscribed = true;

    this.redis.on("message", (channel, message) => {
      if (channel in this.eventToID) {
        const newIds = [];
        for (const id of this.eventToID[channel]!) {
          if (typeof this.idToListener[id] !== "undefined") {
            newIds.push(id);
            this.idToListener[id]!(message);
          }
        }
        if (newIds.length) {
          this.eventToID[channel] = newIds;
        } else {
          delete this.eventToID[channel];
        }
      }
    });
  }

  /**
   * Subscribe to an event on Redis
   * @param eventName The channel that we are listening to
   * @param listener The listener for the channel, takes a
   * @returns
   */
  async on(eventName: string, listener: (...args: any[]) => any): Promise<string> {
    const id = `${uuid()}-${await bcrypt.hash(Date.now().toString(), 10)}`;
    console.log(id);

    void this.redis
      .subscribe(eventName, (err) => {
        if (err) {
          console.error("Failed to subscribe", err.message);
        } else {
          console.log(
            "Successfully subscribed server to channel: %s",
            eventName,
          );
        }
      })
      .then(() => {
        this.idToListener[id] = listener;
        this.map.set(id, true);
        if (!(eventName in this.eventToID)) {
          this.eventToID[eventName] = [];
        }
        this.eventToID[eventName]!.push(id);

        if (!this.subscribed) {
          this.subscribeMessage();
        }
      });

    return id;
  }

  emit(eventName: string, message: object) {
    void this.redis.publish(eventName, superjson.stringify(message));
    return this;
  }

  off(id: string) {
    delete this.idToListener[id];
    if (this.map.size == 0) {
      void this.redis.unsubscribe();
      this.subscribed = false;
    }
  }
}
