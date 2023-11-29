INSERT INTO Permission
VALUES
  /* Distribution Service Permissions */
  (gen_random_uuid(), 'distribution_event', 'create'),
  (gen_random_uuid(), 'distribution_event', 'update'),
  (gen_random_uuid(), 'distribution_event', 'remove'),
  (gen_random_uuid(), 'distribution_rule', 'create'),
  (gen_random_uuid(), 'distribution_rule', 'update'),
  (gen_random_uuid(), 'distribution_rule', 'remove'),
  (gen_random_uuid(), 'subscription', 'create'),
  (gen_random_uuid(), 'subscription', 'update'),
  (gen_random_uuid(), 'subscription', 'remove'),
  (gen_random_uuid(), 'distribution_message', 'publish'),
  /* IAM Service Permissions */
  (gen_random_uuid(), 'user', 'list'),
  (gen_random_uuid(), 'user', 'get'),
  (gen_random_uuid(), 'user', 'create'),
  (gen_random_uuid(), 'user', 'update'),
  (gen_random_uuid(), 'user', 'remove'),
  (gen_random_uuid(), 'permission', 'list'),
  (gen_random_uuid(), 'permission', 'get'),
  (gen_random_uuid(), 'permission', 'create'),
  (gen_random_uuid(), 'permission', 'update'),
  (gen_random_uuid(), 'permission', 'remove'),
  /* Notification Service Permissions */
  (gen_random_uuid(), 'email_template', 'create'),
  (gen_random_uuid(), 'email_template', 'update'),
  (gen_random_uuid(), 'email_template', 'remove'),
  (gen_random_uuid(), 'phone_template', 'create'),
  (gen_random_uuid(), 'phone_template', 'update'),
  (gen_random_uuid(), 'phone_template', 'remove'),
  (gen_random_uuid(), 'push_template', 'create'),
  (gen_random_uuid(), 'push_template', 'update'),
  (gen_random_uuid(), 'push_template', 'remove'),
  (gen_random_uuid(), 'notification', 'send_email'),
  (gen_random_uuid(), 'notification', 'send_sms'),
  (gen_random_uuid(), 'notification', 'send_call'),
  (gen_random_uuid(), 'notification', 'send_push'),
  (gen_random_uuid(), 'notification_job', 'schedule_email'),
  (gen_random_uuid(), 'notification_job', 'schedule_sms'),
  (gen_random_uuid(), 'notification_job', 'schedule_call'),
  (gen_random_uuid(), 'notification_job', 'schedule_push');

SELECT * FROM Permission;