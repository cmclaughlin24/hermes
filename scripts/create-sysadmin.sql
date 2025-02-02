INSERT INTO User_Permissions_Permission ("userId", "permissionId")
SELECT 'REPLACE_WITH_SYSADMIN_ID', id
FROM Permission;