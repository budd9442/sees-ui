variable "project_name" { type = string }
variable "database_url" { type = string }
variable "mq_username" { type = string }
variable "mq_password" { type = string }
variable "nextauth_secret" { type = string }

# Added secrets
variable "xai_api_key" { type = string }
variable "xai_model" { type = string }
variable "brevo_api_key" { type = string }
variable "brevo_sender_email" { type = string }
variable "brevo_sender_name" { type = string }
variable "pusher_app_id" { type = string }
variable "pusher_key" { type = string }
variable "pusher_secret" { type = string }
variable "pusher_cluster" { type = string }
variable "next_public_pusher_key" { type = string }
variable "next_public_pusher_cluster" { type = string }
