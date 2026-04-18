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
  db_password     = var.db_password
}

module "mq" {
  source          = "./modules/mq"
  project_name    = var.project_name
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  mq_username     = var.mq_username
  mq_password     = var.mq_password
}

module "dns" {
  source       = "./modules/dns"
  project_name = var.project_name
  domain_name  = var.domain_name
}

module "ecs" {
  source          = "./modules/ecs"
  project_name    = var.project_name
  vpc_id          = module.vpc.vpc_id
  public_subnets  = module.vpc.public_subnets
  private_subnets = module.vpc.private_subnets
  database_url    = module.rds.database_url
  mq_url          = module.mq.mq_url
  domain_name     = var.domain_name
  certificate_arn = module.dns.certificate_arn
  zone_id         = module.dns.zone_id
}
