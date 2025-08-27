import { Action, UnauthorizedError, ForbiddenError } from "routing-controllers";
import { Container } from "typedi";
import { AuthService } from "@/services/AuthService";
import { UserRole } from "@/constants/UserRole";

export const AuthMiddleware = async (
  action: Action,
  roles: UserRole[],
): Promise<boolean> => {
  try {
    // Step 1: Check if token is present
    const token = action.request.headers.authorization?.split(" ")[1];
    if (!token) throw new UnauthorizedError("No token provided");

    // Step 2: Validate the token and get user
    const authService = Container.get(AuthService);
    const user = await authService.authenticate(token);
    if (!user || !user.status) {
      throw new UnauthorizedError("Invalid or inactive user");
    }

    // Step 3: Ensure user has a role
    if (!user.role) {
      throw new ForbiddenError("User has no assigned role");
    }

    // Step 4: Check if the user's role is allowed
    if (!roles.includes(user.role)) {
      throw new ForbiddenError(
        "User's role does not have permission for this action",
      );
    }

    // Attach user details to the request
    action.request.user = user;
    Container.set("current_action", action);

    return true;
  } catch (error: any) {
    action.response.status(error.httpCode || 401).json({
      status: error.httpCode || 401,
      message: error.message || "Authorization failed",
    });
    return false;
  }
};
