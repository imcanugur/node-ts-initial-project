import { Action } from "routing-controllers";
import { Container } from "typedi";
import { AuthService } from "@/services/AuthService";
import { UserRole } from "@/constants/UserRole";
import { Error } from "@/responses/Errors";

export const AuthMiddleware = async (
  action: Action,
  roles: UserRole[],
): Promise<boolean> => {
  try {
    const token = action.request.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new Error(401, "No token provided");
    }

    const authService = Container.get(AuthService);
    const user = await authService.authenticate(token);

    if (!user || !user.status) {
      throw new Error(401, "Invalid or inactive user");
    }

    if (!user.role) {
      throw new Error(403, "User has no assigned role");
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
      throw new Error(
        403,
        "User's role does not have permission for this action",
        { requiredRoles: roles, userRole: user.role }
      );
    }

    action.request.user = user;
    Container.set("current_action", action);
    return true;
  } catch (err: any) {
    if (err instanceof Error) throw err;

    throw new Error(401, "Authorization failed", {
      original: err?.message,
      path: action.request.originalUrl,
    });
  }
};
