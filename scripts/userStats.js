require("dotenv").config();
const apollo = require("apollo-fetch");

const graph = apollo.createApolloFetch({ uri: process.env.GRAPH_URL });

async function main() {
  const queryFn = async (lastId) => {
    let query = `
    {users(orderBy: id orderDirection: asc first:1000 where:{id_gt: "${lastId}"}) {
      id
      gotchisOwned {
        id
      }
      parcelsOwned {
        id
      }
    }}
        `;

    const { data } = await graph({ query });
    return data;
  };

  let last = "0";
  let allUsers = [];
  let users = [];
  do {
    let data = await queryFn(last);
    users = data.users;
    if (!users || users.length === 0) {
      break;
    }
    allUsers = allUsers.concat(users);
    last = users[users.length - 1].id;
  } while (users.length > 0);

  const usersWithGotchisAndWithParcels = allUsers.filter(
    (e) => e.gotchisOwned.length > 0 && e.parcelsOwned.length > 0
  );

  const usersWithGotchisButWithoutParcels = allUsers.filter(
    (e) => e.gotchisOwned.length > 0 && e.parcelsOwned.length === 0
  );

  const usersWithoutGotchiAndParcel = allUsers.filter(
    (e) => e.gotchisOwned.length === 0 && e.parcelsOwned.length === 0
  );

  const usersWithoutGotchiAndWithParcel = allUsers.filter(
    (e) => e.gotchisOwned.length === 0 && e.parcelsOwned.length > 0
  );

  const usersAmount = usersWithGotchisButWithoutParcels.length;
  const gotchisWithOwnersWithoutParcels = usersWithGotchisButWithoutParcels
    .map((e) => e.gotchisOwned.length)
    .reduce((prev, e) => prev + e);

  console.log("# overall users: " + allUsers.length);
  console.log(
    "# users without gotchi and without parcel: " +
      usersWithoutGotchiAndParcel.length
  );
  console.log("# users with gotchis, but without parcels: " + usersAmount);
  console.log(
    "# users with gotchis and with parcels: " +
      usersWithGotchisAndWithParcels.length
  );
  console.log(
    "# users without gotchi, but with parcels: " +
      usersWithoutGotchiAndWithParcel.length
  );

  console.log(
    "# gotchis of users without parcels: " + gotchisWithOwnersWithoutParcels
  );
}

main();
