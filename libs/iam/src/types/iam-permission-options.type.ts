/**
 * Object for defining the IAM (Identity Access Management) permission for an API.
 */
export interface IamPermissionOptions {
  /**
   * Parameter for specifying an identifier for the resource being accessed.
   */
  resource: string;
  
  /**
   * Parameter for specifying the action to be taken on the resource.
   */
  action: string;
}
