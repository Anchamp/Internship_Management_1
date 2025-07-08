/**
 * Email template for welcoming new users created by an admin
 */
export const getNewUserEmailTemplate = (
  username: string,
  password: string,
  email: string,  // Added email parameter
  organizationName: string
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="background: linear-gradient(to right, #06B6D4, #0891B2); height: 8px; border-radius: 4px; width: 80px; margin: 0 auto;"></div>
        <h1 style="color: #0891B2; font-size: 24px; margin: 15px 0;">Welcome to InternshipHub</h1>
      </div>

      <p style="font-size: 16px; color: #333; line-height: 1.5;">Your account has been created by an administrator from <strong>${organizationName}</strong>. You can now access the platform using the following credentials:</p>
      
      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #06B6D4;">
        <p style="margin: 5px 0; font-size: 16px;"><strong>Username:</strong> <span style="font-family: monospace; background: #eee; padding: 2px 6px; border-radius: 4px;">${username}</span></p>
        <p style="margin: 5px 0; font-size: 16px;"><strong>Email:</strong> <span style="font-family: monospace; background: #eee; padding: 2px 6px; border-radius: 4px;">${email}</span></p>
        <p style="margin: 5px 0; font-size: 16px;"><strong>Password:</strong> <span style="font-family: monospace; background: #eee; padding: 2px 6px; border-radius: 4px;">${password}</span></p>
      </div>
      
      <div style="background-color: #fff7ed; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #f97316;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>Important:</strong> For security reasons, we recommend changing your password immediately after logging in for the first time. You can do this using the "Forgot Password" feature on the login page.
        </p>
      </div>
      
      <p style="font-size: 15px; color: #333; line-height: 1.5;">To get started:</p>
      <ol style="font-size: 15px; color: #333; line-height: 1.5;">
        <li>Log in using the credentials above</li>
        <li>Complete your profile information</li>
        <li>Change your password using the "Forgot Password" feature</li>
      </ol>
      
      <p style="font-size: 15px; color: #333; line-height: 1.5;">If you have any questions or need assistance, please contact your administrator.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} InternshipHub. All rights reserved.</p>
      </div>
    </div>
  `;
};
