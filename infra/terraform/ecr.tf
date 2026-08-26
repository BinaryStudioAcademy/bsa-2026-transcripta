# Private image registry for the backend. Storage is ~$0.10/GB-month; pulls to
# the EC2 instance in the same region are free.
resource "aws_ecr_repository" "backend" {
  name                 = "${var.project}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# Keep only the last few images so storage never grows unbounded.
resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  # Two rules, because a single `tagStatus = "any"` rule leaves untagged layers
  # behind: every push moves `latest` off the previous image and ECR will not
  # rank those untagged leftovers against the tagged ones. That is how 23 images
  # accumulated under a "keep last 5" policy.
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "expire untagged images after a day"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "keep the last 5 tagged images"
        selection = {
          tagStatus      = "tagged"
          tagPatternList = ["*"]
          countType      = "imageCountMoreThan"
          countNumber    = 5
        }
        action = { type = "expire" }
      },
    ]
  })
}

# Let the instance role pull images from ECR (read-only).
resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.app.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# Remote command/log access without SSH or an open port (Session Manager).
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.app.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
