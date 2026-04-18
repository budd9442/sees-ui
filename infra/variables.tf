variable "aws_region" {
  description = "AWS region"
  type        = "string"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = "string"
  default     = "sees-platform"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = "string"
  default     = "10.0.0.0/16"
}

variable "db_name" {
  description = "Database name"
  type        = "string"
  default     = "sees_db"
}

variable "db_username" {
  description = "Database master username"
  type        = "string"
  default     = "sees_admin"
}

variable "db_password" {
  description = "Database master password"
  type        = "string"
  sensitive   = true
}

variable "mq_username" {
  description = "RabbitMQ username"
  type        = "string"
  default     = "mq_user"
}

variable "mq_password" {
  description = "RabbitMQ password"
  type        = "string"
  sensitive   = true
}

variable "domain_name" {
  description = "sees.budd.codes"
  type        = "string"
}
