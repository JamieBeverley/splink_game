#!/usr/bin/env python3
import aws_cdk as cdk
from splink_stack import SplinkStack
import os

app = cdk.App()

SplinkStack(
    app,
    "Splink",
    env=cdk.Environment(
        account=os.environ["AWS_ACCOUNT"],
        # account=app.node.try_get_context("account"),
        region=app.node.try_get_context("region") or "us-east-1",
    ),
)

app.synth()
