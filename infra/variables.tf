variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "sees-platform"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "sees_db"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "sees_admin"
}

variable "mq_username" {
  description = "RabbitMQ username"
  type        = string
  default     = "mq_user"
}

variable "domain_name" {
  description = "Domain name for the platform"
  type        = string
}

# Application Secrets
variable "xai_api_key" {
  type      = string
  sensitive = true
}

variable "xai_model" {
  type    = string
  default = "grok-beta"
}

variable "brevo_api_key" {
  type      = string
  sensitive = true
}

variable "brevo_sender_email" {
  type = string
}

variable "brevo_sender_name" {
  type    = string
  default = "SEES Platform"
}

variable "pusher_app_id" {
  type = string
}

variable "pusher_key" {
  type = string
}

variable "pusher_secret" {
  type      = string
  sensitive = true
}

variable "pusher_cluster" {
  type    = string
  default = "ap2"
}

variable "next_public_pusher_key" {
  type = string
}

variable "next_public_pusher_cluster" {
  type    = string
  default = "ap2"
}
