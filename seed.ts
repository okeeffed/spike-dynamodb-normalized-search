import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { faker } from "@faker-js/faker";

const client = new DynamoDBClient({
  endpoint: `http://localhost:4566`,
});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const TABLE_NAMES = [
  "ActivitiesAndUsers",
  // "ActivitiesAndUsersWithES"
];

const NUM_USERS = 50;
const NUM_ACTIVITIES = 1000;

/**
 * Seed users with random data.
 */
async function seedUsers(tableName: string) {
  let users = [];
  let items = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const userId = faker.string.uuid();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();

    items.push({
      PutRequest: {
        Item: {
          PK: `USER#${userId}`,
          SK: `USER#${userId}`,
          FirstName: firstName,
          LastName: lastName,
          Email: email,
          // SearchableFirstName
          GSI1PK: "USER#SearchableFirstName",
          GSI1SK: firstName.toLowerCase(),
          // SearchableLastName
          GSI2PK: "USER#SearchableLastName",
          GSI2SK: lastName.toLowerCase(),
          // SearchableEmail
          GSI3PK: "USER#SearchableEmail",
          GSI3SK: email.toLowerCase(),
          EntityType: "USER",
        },
      },
    });

    if (items.length === 10) {
      await ddbDocClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName]: items,
          },
        })
      );
      items.length = 0; // Clear the array
    }

    console.log(`User ${i + 1} seeded`);
    users.push(userId);
  }

  // Handle any remaining items
  if (items.length > 0) {
    await ddbDocClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: items,
        },
      })
    );
  }

  return users;
}

/**
 * Seed activities for the given users. This is done so that
 * some users become searchable from the `main.ts` file.
 */
async function seedActivities(tableName: string, users: string[] = []) {
  const items = [];
  for (let i = 0; i < NUM_ACTIVITIES; i++) {
    const activityId = faker.string.uuid();
    const user = users[i % users.length];

    // console.log(`Seeding activity ${i + 1} for user ${user}...`);

    items.push({
      PutRequest: {
        Item: {
          PK: `STORE#123`,
          SK: `STORE#123#ACTIVITY#${activityId}`,
          Timestamp: new Date().toISOString(),
          Details: faker.lorem.sentence(),
          EntityType: "STORE#123#ACTIVITY",
          GSI1PK: `USER#${user}`,
          GSI1SK: `ACTIVITY#${activityId}`,
        },
      },
    });

    // This seeds the same entities for the ElasticSearch spike
    // items.push({
    //   PutRequest: {
    //     Item: {
    //       PK: `STORE#123`,
    //       SK: `STORE#123#ACTIVITY#${activityId}`,
    //       Timestamp: new Date().toISOString(),
    //       Details: faker.lorem.sentence(),
    //       EntityType: "STORE#123#ACTIVITY",
    //       GSI1PK: `USER#${user}`,
    //       GSI1SK: `ACTIVITY#${activityId}`,
    //     },
    //   },
    // });

    if (items.length === 10) {
      await ddbDocClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName]: items,
          },
        })
      );
      items.length = 0; // Clear the array
    }

    if (i % 100 === 0) {
      console.log(`Activity ${i + 1} seeded`);
    }
  }

  // Handle any remaining items
  if (items.length > 0) {
    await ddbDocClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: items,
        },
      })
    );
  }
}

async function seedData() {
  for (const tableName of TABLE_NAMES) {
    console.log(`Seeding data for table: ${tableName}`);

    console.log("Seeding users...");
    const users = await seedUsers(tableName);

    console.log("Seeding activities...");
    await seedActivities(tableName, users);

    console.log("Seeding completed.");
  }
}

seedData().catch(console.error);
