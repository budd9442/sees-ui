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

module "mq" {
  source          = "./modules/mq"
  project_name    = var.project_name
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  mq_username     = var.mq_username
  mq_password     = random_password.mq_password.result
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
  mq_url       = module.mq.mq_url
  nextauth_secret = random_password.nextauth_secret.result
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
  
  # Inject Secrets Manager ARNs instead of raw variables
  database_url_secret_arn = module.secrets.database_url_secret_arn
  mq_url_secret_arn       = module.secrets.mq_url_secret_arn
  nextauth_secret_arn     = module.secrets.nextauth_secret_arn
}
