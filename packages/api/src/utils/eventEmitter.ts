// This is a custom EventEmitter inspired class that uses Redis as the backend

import * as bcrypt from "bcryptjs";
import Redis from "ioredis";
import superjson from "superjson";
import { v4 as uuid } from "uuid";

// Can't extend here because we have some specifics that are non-existent on EventEmitter
export class RedisEventEmitter {
  // The redis client
  redis: Redis;

  // Hashmaps/objects that contain the event listeners
  map = new Map<string, boolean>();
  eventToID: {
    [event: string]: string[] | undefined;
  } = {};
  idToListener: {
    [id: string]: ((...args: any[]) => any) | undefined;
  } = {};

  // Whether or not we are subscribed to a channel
  // We subscribe to a channel when we have listeners so non-ws servers don't enter subscription mode
  subscribed = false;

  // Magic function called when we initialize the event emitter
  constructor() {
    // Initialize the redis client
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  // Subscribe to messages
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
  async on(
    eventName: string,
    listener: (...args: any[]) => any,
  ): Promise<string> {
    // Generate an ID for the listener
    const id = `${uuid()}-${await bcrypt.hash(Date.now().toString(), 10)}`;

    // Subscribe to the channel
    void this.redis
      .subscribe(eventName, (err) => {
        // Log error or success
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
        // Save the listener
        this.idToListener[id] = listener;
        this.map.set(id, true);

        // Save the channel
        if (!(eventName in this.eventToID)) {
          this.eventToID[eventName] = [];
        }
        this.eventToID[eventName]!.push(id);

        // Subscribe to messages if not
        if (!this.subscribed) {
          this.subscribeMessage();
        }
      });

    return id;
  }

  emit(eventName: string, message: object) {
    // Publish the message
    void this.redis.publish(eventName, superjson.stringify(message));

    // Return this for chaining
    return this;
  }

  off(id: string) {
    // Remove the listener
    delete this.idToListener[id];

    // Unsubscribe if we have no listeners (enter idle mode)
    if (this.map.size == 0) {
      void this.redis.unsubscribe();
      this.subscribed = false;
    }

    // Return this for chaining
    return this;
  }
}
