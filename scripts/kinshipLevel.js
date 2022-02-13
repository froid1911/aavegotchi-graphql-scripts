require("dotenv").config();
const apollo = require("apollo-fetch");

const graph = apollo.createApolloFetch({ uri: process.env.GRAPH_URL });

// 0-50
// 51-100
// 101-200
// 201-500
// 500-1000

let skip = {};

let levels = {
  "0-50": 0,
  "51-100": 0,
  "101-200": 0,
  "201-500": 0,
  "501-1000": 0,
};

async function main() {
  let promisses = [];
  for (let i = 0; i < 30000; i += 100) {
    let query = `
        {
            aavegotchis(first: 100, orderBy: id, orderDirection:asc, where: {id_gt: ${i}}) {
                id
                kinship
            }
        }
        `;

    promisses.push(graph({ query }));
  }

  const results = await Promise.all(promisses);
  results.forEach((e) => {
    let gotchis = e.data.aavegotchis;
    gotchis.forEach((element) => {
      if (skip[element.id]) {
        return;
      } else {
        skip[element.id] = true;
      }
      let kinship = parseInt(element.kinship);
      if (kinship < 51) {
        levels["0-50"]++;
      } else if (kinship < 101) {
        levels["51-100"]++;
      } else if (kinship < 201) {
        levels["101-200"]++;
      } else if (kinship < 501) {
        levels["201-500"]++;
      } else {
        console.log(kinship);
        levels["501-1000"]++;
      }
    });
  });

  console.log(levels);
  console.log("gotchis: " + Object.keys(skip).length);
}

main();
