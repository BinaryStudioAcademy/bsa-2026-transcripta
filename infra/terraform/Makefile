PROFILE ?= roman
REGION  ?= us-east-1
IID      = $(shell terraform output -raw instance_id 2>/dev/null)

.PHONY: init plan up stop start status ssh outputs down

init:                    ## download provider, prepare backend
	terraform init

plan:                    ## show what would change (creates nothing)
	terraform plan

up:                      ## create / update everything (this costs money)
	terraform apply

## ---- turn OFF / ON — the instance and its EBS (all data) are kept ----
stop:                    ## power off, pay only for storage
	aws ec2 stop-instances  --profile $(PROFILE) --region $(REGION) --instance-ids $(IID)
	@echo ">> stopped $(IID). EBS (Postgres data + settings) preserved. 'make start' resumes from the same place."

start:                   ## power back on, same instance, same data, same IP
	aws ec2 start-instances --profile $(PROFILE) --region $(REGION) --instance-ids $(IID)

status:                  ## running / stopped?
	@aws ec2 describe-instances --profile $(PROFILE) --region $(REGION) --instance-ids $(IID) --query "Reservations[].Instances[].State.Name" --output text

ssh:                     ## shell into the box
	ssh -i ~/.ssh/transcripta_ed25519 ubuntu@$(shell terraform output -raw public_ip)

outputs:                 ## print IP + bucket names for the .env
	terraform output

## ---- tear everything down to $0 (S3 uploads survive while force_destroy=false) ----
down:                    ## delete instance, EIP, SG, IAM. Deliberate nuke, not "turn off".
	terraform destroy
