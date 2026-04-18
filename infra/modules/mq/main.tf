resource "aws_security_group" "mq" {
  name        = "${var.project_name}-mq-sg"
  description = "Allow inbound traffic to RabbitMQ"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5671 # AMQPS
    to_port     = 5671
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  ingress {
    from_port   = 5672 # AMQP
    to_port     = 5672
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  ingress {
    from_port   = 15671 # Management Console HTTPS
    to_port     = 15672 # Management Console HTTP
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_mq_broker" "main" {
  broker_name = "${var.project_name}-mq"

  engine_type        = "RabbitMQ"
  engine_version     = "3.13"
  host_instance_type = "mq.t3.micro"
  
  publicly_accessible = false
  subnet_ids          = [var.private_subnets[0]]
  security_groups     = [aws_security_group.mq.id]

  user {
    username = var.mq_username
    password = var.mq_password
  }

  tags = {
    Name = "${var.project_name}-mq"
  }
}

output "mq_url" {
  # RabbitMQ URL format for amqplib: amqps://user:pass@host:port
  value = "amqps://${var.mq_username}:${var.mq_password}@${aws_mq_broker.main.instances[0].endpoint}"
}
