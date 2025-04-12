provider "aws" {
    region = var.region
}

resource "aws_instance" "mern_app" {
    ami           = "ami-0c1ade727754a7a75"
    instance_type = var.instance_type
    user_data = <<-EOF
    #!/bin/bash
    set -e

    echo "Setting up authorized_keys at $(date)" >> /var/log/user-data.log

    mkdir -p /home/ubuntu/.ssh
    echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDcgxwv5hz+FKMbOQnTh7x76BhBR2hW+CfwQEjR43d/AmlHSgAeWf6K4o36p0POVcdlq7ialJPv2a40A7V55nGgTnGG0r0e78ky7nhIfefDwaICXTnf7cmndw3V5EwIubQ0IX3bffgduWPC/69B2ymdWx0Y7IC1CZEN3sZ0K4hTIMw1rikkftRKCGU5HTs2X8zu/PEkmDxOGvw+6Y2Zb5B0EByiNOEEmAZ8LNLulwN87NE+L6vs81jr0JYOp9zosznOfmYQxrNw+Kj3imy0/AI55WJKenqpAHO8yGMxxR3C6djx+2mJ2hforjJTWPzDHs3L0XpIEdfh1URRORw3OG3v" > /home/ubuntu/.ssh/authorized_keys
    chown -R ubuntu:ubuntu /home/ubuntu/.ssh
    chmod 700 /home/ubuntu/.ssh
    chmod 600 /home/ubuntu/.ssh/authorized_keys
    EOF

    security_groups = [aws_security_group.allow_ssh_http.name]

    tags = {
    Name = "MERN-App-Server"
    }
}

resource "aws_security_group" "allow_ssh_http" {
    name        = "allow_ssh_http"
    description = "Allow SSH and Web"

    ingress {
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["24.21.221.193/32"]
    }

    ingress {
        from_port   = 3000
        to_port     = 3000
        protocol    = "tcp"
        cidr_blocks = ["24.21.221.193/32"]
    }

    ingress {
        from_port   = 5001
        to_port     = 5001
        protocol    = "tcp"
        cidr_blocks = ["24.21.221.193/32"]
    }

    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["24.21.221.193/32"]
    }
}
