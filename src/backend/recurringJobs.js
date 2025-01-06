import { cleanMemberLoginTokens, deleteUsers } from '@prospectorminerals/memberfunctions-backend';

export function cleanMemberLoginTokensHandler() {
    return cleanMemberLoginTokens();
}

export function deleteUsersHandler() {
    return deleteUsers();
}