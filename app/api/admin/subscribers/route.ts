import { api } from "@/lib/api";
import { Subscriber } from "@/lib/models/Subscriber";

export const GET = api(async () => Subscriber.find().sort({ createdAt: -1 }).lean(), { admin: true });
