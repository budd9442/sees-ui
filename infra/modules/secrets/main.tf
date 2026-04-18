resource "aws_secretsmanager_secret" "database_url" {
  name = "${var.project_name}-database-url"
  recovery_window_in_days = 0 # Force delete for testing, change for production
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = var.database_url
}

resource "aws_secretsmanager_secret" "mq_url" {
  name = "${var.project_name}-mq-url"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "mq_url" {
  secret_id     = aws_secretsmanager_secret.mq_url.id
  secret_string = "amqp://${var.mq_username}:${var.mq_password}@rabbitmq.${var.project_name}.local:5672"
}

resource "aws_secretsmanager_secret" "nextauth_secret" {
  name = "${var.project_name}-nextauth-secret"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "nextauth_secret" {
  secret_id     = aws_secretsmanager_secret.nextauth_secret.id
  secret_string = var.nextauth_secret
}

resource "aws_secretsmanager_secret" "brevo_api_key" {
  name = "${var.project_name}-brevo-api-key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "brevo_api_key" {
  secret_id     = aws_secretsmanager_secret.brevo_api_key.id
  secret_string = var.brevo_api_key
}

resource "aws_secretsmanager_secret" "brevo_sender_email" {
  name = "${var.project_name}-brevo-sender-email"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "brevo_sender_email" {
  secret_id     = aws_secretsmanager_secret.brevo_sender_email.id
  secret_string = var.brevo_sender_email
}

resource "aws_secretsmanager_secret" "brevo_sender_name" {
  name = "${var.project_name}-brevo-sender-name"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "brevo_sender_name" {
  secret_id     = aws_secretsmanager_secret.brevo_sender_name.id
  secret_string = var.brevo_sender_name
}

resource "aws_secretsmanager_secret" "xai_api_key" {
  name = "${var.project_name}-xai-api-key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "xai_api_key" {
  secret_id     = aws_secretsmanager_secret.xai_api_key.id
  secret_string = var.xai_api_key
}

resource "aws_secretsmanager_secret" "xai_model" {
  name = "${var.project_name}-xai-model"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "xai_model" {
  secret_id     = aws_secretsmanager_secret.xai_model.id
  secret_string = var.xai_model
}

resource "aws_secretsmanager_secret" "pusher_app_id" {
  name = "${var.project_name}-pusher-app-id"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "pusher_app_id" {
  secret_id     = aws_secretsmanager_secret.pusher_app_id.id
  secret_string = var.pusher_app_id
}

resource "aws_secretsmanager_secret" "pusher_key" {
  name = "${var.project_name}-pusher-key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "pusher_key" {
  secret_id     = aws_secretsmanager_secret.pusher_key.id
  secret_string = var.pusher_key
}

resource "aws_secretsmanager_secret" "pusher_secret" {
  name = "${var.project_name}-pusher-secret"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "pusher_secret" {
  secret_id     = aws_secretsmanager_secret.pusher_secret.id
  secret_string = var.pusher_secret
}

resource "aws_secretsmanager_secret" "pusher_cluster" {
  name = "${var.project_name}-pusher-cluster"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "pusher_cluster" {
  secret_id     = aws_secretsmanager_secret.pusher_cluster.id
  secret_string = var.pusher_cluster
}

resource "aws_secretsmanager_secret" "next_public_pusher_key" {
  name = "${var.project_name}-next-public-pusher-key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "next_public_pusher_key" {
  secret_id     = aws_secretsmanager_secret.next_public_pusher_key.id
  secret_string = var.next_public_pusher_key
}

resource "aws_secretsmanager_secret" "next_public_pusher_cluster" {
  name = "${var.project_name}-next-public-pusher-cluster"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "next_public_pusher_cluster" {
  secret_id     = aws_secretsmanager_secret.next_public_pusher_cluster.id
  secret_string = var.next_public_pusher_cluster
}

output "database_url_secret_arn" {
  value = aws_secretsmanager_secret.database_url.arn
}

output "mq_url_secret_arn" {
  value = aws_secretsmanager_secret.mq_url.arn
}

output "nextauth_secret_arn" {
  value = aws_secretsmanager_secret.nextauth_secret.arn
}

output "brevo_api_key_arn" { value = aws_secretsmanager_secret.brevo_api_key.arn }
output "brevo_sender_email_arn" { value = aws_secretsmanager_secret.brevo_sender_email.arn }
output "brevo_sender_name_arn" { value = aws_secretsmanager_secret.brevo_sender_name.arn }
output "xai_api_key_arn" { value = aws_secretsmanager_secret.xai_api_key.arn }
output "xai_model_arn" { value = aws_secretsmanager_secret.xai_model.arn }
output "pusher_app_id_arn" { value = aws_secretsmanager_secret.pusher_app_id.arn }
output "pusher_key_arn" { value = aws_secretsmanager_secret.pusher_key.arn }
output "pusher_secret_arn" { value = aws_secretsmanager_secret.pusher_secret.arn }
output "pusher_cluster_arn" { value = aws_secretsmanager_secret.pusher_cluster.arn }
output "next_public_pusher_key_arn" { value = aws_secretsmanager_secret.next_public_pusher_key.arn }
output "next_public_pusher_cluster_arn" { value = aws_secretsmanager_secret.next_public_pusher_cluster.arn }
