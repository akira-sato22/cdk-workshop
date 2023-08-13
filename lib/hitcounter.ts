import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { DynamoAttributeValue } from 'aws-cdk-lib/aws-stepfunctions-tasks';

export interface HitCounterProps {
    // the function for which we want to count url hits
    downstream: lambda.IFunction;
}

export class HitCounter extends Construct {

    // allows accessing the counter function
    public readonly handler: lambda.Function;

    constructor(scope: Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        const table = new dynamodb.Table(this, 'Hits', {
            partitionKey: {name: 'path', type: dynamodb.AttributeType.STRING }
        });

        // lambda/hitcount.handler にバインドされる Lambda 関数を定義
        this.handler = new lambda.Function(this, 'HitCounterHandler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'hitcounter.handler',
            code: lambda.Code.fromAsset('lambda'),
            // Lambda 関数の環境変数をリソースの function_name と table_name に 紐付け
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName
             }
        } );

    }
}