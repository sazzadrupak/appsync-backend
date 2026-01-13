# appsync-backend

This project contains the backend infrastructure code for an AppSync-based application. It uses the Serverless Framework to define and deploy AWS resources such as AppSync APIs, Lambda functions, and DynamoDB tables.

```
  {
    "version" : "2018-05-29",
    "operation" : "Query",
    "query" : {
      "expression" : "creator = :userId",
      "expressionValues" : {
        ":userId" : $util.dynamodb.toDynamoDBJson($context.arguments.userId)
      }
    },
    "index" : "byCreator",
    "nextToken" : $util.toJson($context.arguments.nextToken),
    "limit" : $util.toJson($context.arguments.limit),
    "scanIndexForward" : false, // it means I want to get the items ordered by the range key in descending order
    "consistentRead" : false,
    "select" : "ALL_ATTRIBUTES" // set it "ALL_ATTRIBUTES" when you are using GSI in DynanoDB
  }
```