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
  secret_string = var.mq_url
}

resource "aws_secretsmanager_secret" "nextauth_secret" {
  name = "${var.project_name}-nextauth-secret"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "nextauth_secret" {
  secret_id     = aws_secretsmanager_secret.nextauth_secret.id
  secret_string = var.nextauth_secret
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
