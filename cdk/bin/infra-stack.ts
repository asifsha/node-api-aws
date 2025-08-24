import {
  Stack, StackProps, CfnOutput, Duration, RemovalPolicy,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ECR repository to push images from CI
    const repo = new ecr.Repository(this, 'node-api', {
      repositoryName: 'node-api',
      removalPolicy: RemovalPolicy.RETAIN,
      imageScanOnPush: true,
    });

    const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 2 });

    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });

    // CloudWatch log group for the service
    const logGroup = new logs.LogGroup(this, 'ServiceLogs', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Fargate + ALB pattern
    const fargate = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Service', {
      cluster,
      cpu: 256,
      memoryLimitMiB: 512,
      desiredCount: 2,
      publicLoadBalancer: true,
      taskImageOptions: {
        // Placeholder image; CI will update task definition to new image on deploy
        image: ecs.ContainerImage.fromRegistry('public.ecr.aws/nginx/nginx:alpine'),
        containerPort: 80,
        enableLogging: true,
        logDriver: ecs.LogDrivers.awsLogs({ logGroup, streamPrefix: 'game-2048' }),
      },
    });

    // Autoscaling
    const scaling = fargate.service.autoScaleTaskCount({ minCapacity: 2, maxCapacity: 10 });
    scaling.scaleOnCpuUtilization('CpuScale', {
      targetUtilizationPercent: 50,
      scaleInCooldown: Duration.seconds(60),
      scaleOutCooldown: Duration.seconds(60),
    });

    // Allow task to pull from ECR (if private)
    repo.grantPull(fargate.taskDefinition.obtainExecutionRole());

    new CfnOutput(this, 'EcrRepositoryUri', { value: repo.repositoryUri });
    new CfnOutput(this, 'EcsClusterName', { value: cluster.clusterName });
    new CfnOutput(this, 'EcsServiceName', { value: fargate.service.serviceName });
    new CfnOutput(this, 'LoadBalancerUrl', { value: `http://${fargate.loadBalancer.loadBalancerDnsName}` });
    new CfnOutput(this, 'TaskDefinitionFamily', { value: fargate.taskDefinition.family });
  }
}
