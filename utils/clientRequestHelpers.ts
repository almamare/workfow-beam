import type { Client } from '@/stores/types/clients';
import type { TaskRequest } from '@/stores/types/tasks_requests';

/** Task request row may expose client_id; for type "Clients" the DB also stores client id in task_order_id. */
export type TaskRequestWithClientLink = TaskRequest & { client_id?: string };

/**
 * Resolves the clients table primary key linked to this task request.
 * Backend (ClientsModel) stores the new client's id in tasks_requests.task_order_id for request_type "Clients".
 */
export function getLinkedClientId(request: TaskRequestWithClientLink): string | null {
    const raw = (request.client_id ?? request.task_order_id ?? '').toString().trim();
    return raw.length > 0 ? raw : null;
}

/**
 * True when core client fields are present (aligned with createClient required: name, state, city, budget, client_type).
 */
export function isClientProfileComplete(client: Client | undefined): boolean {
    if (!client) return false;
    const name = String(client.name ?? '').trim();
    const clientNo = String(client.client_no ?? '').trim();
    const state = String(client.state ?? '').trim();
    const city = String(client.city ?? '').trim();
    const type = String(client.client_type ?? '').trim();
    const budgetRaw = client.budget != null ? String(client.budget).trim() : '';
    const budgetNum = Number(String(budgetRaw).replace(/,/g, ''));
    const budgetOk = budgetRaw !== '' && Number.isFinite(budgetNum);
    return Boolean(name && clientNo && state && city && type && budgetOk);
}
