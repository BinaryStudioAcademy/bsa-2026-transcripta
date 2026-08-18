# GitHub Actions -> AWS via OIDC. No static keys stored in GitHub: the workflow
# assumes this role with a short-lived token to push images to ECR and trigger a
# redeploy on the instance through SSM.

data "aws_region" "current" {}

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}

data "aws_iam_policy_document" "gha_assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    # The org customizes the OIDC subject template, so `repo:owner/repo:*` on
    # `sub` does not match. `job_workflow_ref` is unaffected by that and AWS
    # accepts it as the required scoping claim.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:job_workflow_ref"
      values   = ["${var.github_repo}/.github/workflows/deploy.yml@*"]
    }
  }
}

resource "aws_iam_role" "gha" {
  name               = "${var.project}-github-actions"
  assume_role_policy = data.aws_iam_policy_document.gha_assume.json
}

data "aws_iam_policy_document" "gha" {
  statement {
    sid       = "EcrAuth"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }
  statement {
    sid = "EcrPush"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
    ]
    resources = [aws_ecr_repository.backend.arn]
  }
  statement {
    sid     = "SsmDeploy"
    actions = ["ssm:SendCommand"]
    resources = [
      "arn:aws:ssm:${data.aws_region.current.name}::document/AWS-RunShellScript",
      "arn:aws:ec2:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:instance/*",
    ]
  }
  statement {
    sid       = "SsmResult"
    actions   = ["ssm:GetCommandInvocation", "ssm:ListCommandInvocations"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "gha" {
  name   = "${var.project}-gha"
  role   = aws_iam_role.gha.id
  policy = data.aws_iam_policy_document.gha.json
}

output "github_actions_role_arn" {
  description = "Put this in .github/workflows/deploy.yml as role-to-assume"
  value       = aws_iam_role.gha.arn
}
