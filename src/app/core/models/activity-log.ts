import { ActivityLogAction } from "../enums/activity-log-action";
import { ActivityLogUser } from "./activity-log-user";

export interface ActivityLog {
    id: any,
    origin_type: string;
    origin_id: string;
    action: ActivityLogAction;
    action_label: string;
    description?: string;
    route_name?: string;
    route_path?: string;
    user_agent?: string;
    user?: ActivityLogUser
    created_at: Date;
}
