provider "aws" {
    region = var.region
}

resource "aws_instance" "mern_app" {
    ami           = "ami-04e914639d0cca79a"  # Ubuntu 20.04
    instance_type = var.instance_type
    user_data = file("${path.module}/setup-ssh.sh")

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
