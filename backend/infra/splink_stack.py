from aws_cdk import (
    CfnOutput,
    Duration,
    RemovalPolicy,
    Stack,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_s3 as s3,
)
from constructs import Construct


class SplinkStack(Stack):
    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # ── S3 bucket ─────────────────────────────────────────────────────────
        # Private — CloudFront is the only entry point.
        bucket = s3.Bucket(
            self,
            "PuzzlesBucket",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=RemovalPolicy.RETAIN,  # keep puzzle files on stack destroy
        )

        # ── CloudFront OAC ────────────────────────────────────────────────────
        # Grants CloudFront read access to the private bucket.
        oac = cloudfront.S3OriginAccessControl(self, "OAC")

        # ── CORS response headers policy ──────────────────────────────────────
        cors_policy = cloudfront.ResponseHeadersPolicy(
            self,
            "CorsPolicy",
            response_headers_policy_name=f"{id}-cors",
            cors_behavior=cloudfront.ResponseHeadersCorsBehavior(
                access_control_allow_credentials=False,
                access_control_allow_headers=["*"],
                access_control_allow_methods=["GET", "HEAD"],
                access_control_allow_origins=["https://splink.jamiebeverley.net"],
                origin_override=True,
            ),
        )

        # ── CloudFront distribution ───────────────────────────────────────────
        distribution = cloudfront.Distribution(
            self,
            "Distribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(
                    bucket,
                    origin_access_control=oac,
                ),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED,
                response_headers_policy=cors_policy,
            ),
            price_class=cloudfront.PriceClass.PRICE_CLASS_100,  # US, CA, EU
        )

        # ── Outputs ───────────────────────────────────────────────────────────
        CfnOutput(
            self,
            "BucketName",
            value=bucket.bucket_name,
            description="Set as SPLINK_BUCKET when running generate_puzzles.py",
        )

        CfnOutput(
            self,
            "PuzzlesUrl",
            value=f"https://{distribution.distribution_domain_name}",
            description="Set as VITE_PUZZLES_URL in .env.local",
        )
