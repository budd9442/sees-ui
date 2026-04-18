# Random Passwords
resource "random_password" "db_password" {
  length  = 16
  special = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "random_password" "mq_password" {
  length  = 16
  special = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "random_password" "nextauth_secret" {
  length  = 32
  special = true
}

module "vpc" {
  source       = "./modules/vpc"
  project_name = var.project_name
  vpc_cidr     = var.vpc_cidr
}

module "rds" {
  source          = "./modules/rds"
  project_name    = var.project_name
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  db_name         = var.db_name
  db_username     = var.db_username
  db_password     = random_password.db_password.result
}


module "dns" {
  source       = "./modules/dns"
  project_name = var.project_name
  domain_name  = var.domain_name
}

# Connection strings stored in Secrets Manager for runtime ECS access
module "secrets" {
  source       = "./modules/secrets"
  project_name = var.project_name
  database_url = module.rds.database_url
  mq_username  = var.mq_username
  mq_password  = random_password.mq_password.result
  nextauth_secret = random_password.nextauth_secret.result
  
  # Forward application secrets
  xai_api_key                = var.xai_api_key
  xai_model                  = var.xai_model
  brevo_api_key              = var.brevo_api_key
  brevo_sender_email         = var.brevo_sender_email
  brevo_sender_name          = var.brevo_sender_name
  pusher_app_id              = var.pusher_app_id
  pusher_key                 = var.pusher_key
  pusher_secret              = var.pusher_secret
  pusher_cluster             = var.pusher_cluster
  next_public_pusher_key     = var.next_public_pusher_key
  next_public_pusher_cluster = var.next_public_pusher_cluster
}

module "ecs" {
  source          = "./modules/ecs"
  project_name    = var.project_name
  vpc_id          = module.vpc.vpc_id
  public_subnets  = module.vpc.public_subnets
  private_subnets = module.vpc.private_subnets
  domain_name     = var.domain_name
  certificate_arn = module.dns.certificate_arn
  zone_id         = module.dns.zone_id
  
  service_discovery_namespace_id = module.vpc.service_discovery_namespace_id
  mq_username                    = var.mq_username
  mq_password                    = random_password.mq_password.result
  
  # Inject Secrets Manager ARNs instead of raw variables
  database_url_secret_arn   = module.secrets.database_url_secret_arn
  mq_url_secret_arn         = module.secrets.mq_url_secret_arn
  nextauth_secret_arn       = module.secrets.nextauth_secret_arn
  brevo_api_key_arn         = module.secrets.brevo_api_key_arn
  brevo_sender_email_arn    = module.secrets.brevo_sender_email_arn
  brevo_sender_name_arn     = module.secrets.brevo_sender_name_arn
  xai_api_key_arn           = module.secrets.xai_api_key_arn
  xai_model_arn             = module.secrets.xai_model_arn
  pusher_app_id_arn         = module.secrets.pusher_app_id_arn
  pusher_key_arn            = module.secrets.pusher_key_arn
  pusher_secret_arn         = module.secrets.pusher_secret_arn
  pusher_cluster_arn        = module.secrets.pusher_cluster_arn
  next_public_pusher_key_arn = module.secrets.next_public_pusher_key_arn
  next_public_pusher_cluster_arn = module.secrets.next_public_pusher_cluster_arn
}
