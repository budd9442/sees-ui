output "nameservers" {
  description = "The Nameservers to set at your domain registrar (name.com)"
  value       = module.dns.name_servers
}

output "alb_dns_name" {
  description = "The DNS name of the load balancer"
  value       = module.ecs.alb_dns_name
}

output "application_url" {
  description = "The URL of the application"
  value       = "https://${var.domain_name}"
}
