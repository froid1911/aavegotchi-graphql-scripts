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
  for (let i = 0; i < 30000; i += 1000) {
    let { users } = await queryFn(last);

    if (!users || users.length === 0) {
      break;
    }
    allUsers = allUsers.concat(users);
    last = users[users.length - 1].id;
  }

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

  console.log("# overall owners: " + allUsers.length);
  console.log(
    "# owners without gotchi and without parcel: " +
      usersWithoutGotchiAndParcel.length
  );
  console.log("# owners with gotchis, but without parcels: " + usersAmount);
  console.log(
    "# owners with gotchis and with parcels: " +
      usersWithGotchisAndWithParcels.length
  );
  console.log(
    "# owners without gotchi, but with parcels: " +
      usersWithoutGotchiAndWithParcel.length
  );

  console.log(
    "# gotchis of owners without parcels: " + gotchisWithOwnersWithoutParcels
  );

  // console.log("gotchis: " + Object.keys(skip).length);
}

main();
