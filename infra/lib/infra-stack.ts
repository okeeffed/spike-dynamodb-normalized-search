import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class MyDynamoDBStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "ActivitiesAndUsers", {
      tableName: "ActivitiesAndUsers",
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // or PROVISIONED
    });

    // Adding a Global Secondary Index for the user to find their activities
    table.addGlobalSecondaryIndex({
      indexName: "GSI-UserActivities",
      partitionKey: {
        name: "SK",
        type: dynamodb.AttributeType.STRING,
      },
      // We are searching based on `Activity#`.
      sortKey: {
        name: "EntityType",
        type: dynamodb.AttributeType.STRING,
      },
    });

    // Adding a Global Secondary Index for searchable first name
    table.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: {
        name: "GSI1PK",
        type: dynamodb.AttributeType.STRING,
      },
      // Uncomment the following if you decide to add a sort key for the GSI
      sortKey: {
        name: "GSI1SK",
        type: dynamodb.AttributeType.STRING,
      },
    });

    // Repeat for other searchable attributes as necessary
    // Note: Each additional GSI increases cost and has throughput considerations
    table.addGlobalSecondaryIndex({
      indexName: "GSI2",
      partitionKey: {
        name: "GSI2PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "GSI2SK",
        type: dynamodb.AttributeType.STRING,
      },
    });

    table.addGlobalSecondaryIndex({
      indexName: "GSI3",
      partitionKey: {
        name: "GSI3PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "GSI3SK", type: dynamodb.AttributeType.STRING },
    });
  }
}

const app = new cdk.App();
new MyDynamoDBStack(app, "MyDynamoDBStack");
