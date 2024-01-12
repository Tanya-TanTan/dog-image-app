import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express()
const port = 3000;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

// First I have created an asynchronous function that fetches a list of dog breeds from the "https://dog.ceo/api/breeds/list/all" API endpoint.

const getBreedList = async () => {
    try {
        const response = await axios.get("https://dog.ceo/api/breeds/list/all");
        const breedsData = response.data.message;
        const breedList = [];
        // Iterating over every breed in breedsData object
        for (const breed in breedsData) {
            // Accessing and storing the subBreed array in the subBreedArray 
            // This line is extracting the value associated with the current key(breed) from the breedsData object and assigning it to const subBreedArray. Using square brackets [] to access the property of breedsData object returns the value associated with that property.
            const subBreedArray = breedsData[breed];
            if (subBreedArray.length === 0) {
                breedList.push(breed);
            } else {
                subBreedArray.forEach(subBreed => {
                    breedList.push(`${breed} ${subBreed}`);
                });
            }
        }
        return breedList;
    } catch (error) {
        console.error(error.response.data);
        throw error;
    }
};

// In the below code, the "/" root path renders the "index.ejs" template with the list of dog breeds obtained from getBreedList.

app.get("/", async (req, res) => {
    try {
        const breedList = await getBreedList();
        res.render("index.ejs", { dogBreed: breedList });
    } catch (error) {
        res.status(500).send("Error fetching breed list");
    }
});

// In the below code, the "/select-breed" route handles the selection of a specific dog breed. It makes a request to the API based on the selected breed and renders the result on the "index.ejs" template.

app.post("/select-breed", async (req, res) => {
    try {
    const selectedBreed = req.body.selectBreed; 
    let apiEndpoint;
    if (selectedBreed.includes(' ')) {
        apiEndpoint = `https://dog.ceo/api/breed/${selectedBreed.replace(' ', '/')}/images/random`;
    } else {
        apiEndpoint = `https://dog.ceo/api/breed/${selectedBreed}/images/random`;
    }
    const response = await axios.get(apiEndpoint);
    const result = response.data.message;
    const breedList = await getBreedList();
    res.render("index.ejs", {dogBreed: breedList, selectedBreed: result, randomBreed: null, nameOfBreed: selectedBreed});
} catch (error) {
        console.log(error.response.data);
        res.status(500).send("Error fetching selected breed");
    }
})

// In the below code, the "/random-breed" route fetches a random dog breed image from the API and extracts the breed name from the image URL as shown in the code below. It then renders the "index.ejs" template with the random breed information.

app.post("/random-breed", async (req, res) => {
    try{
    const breedList = await getBreedList();
    const response = await axios.get("https://dog.ceo/api/breeds/image/random")
    const result = response.data.message
    const parts = result.split("/"); 
    const randomBreedName = parts[parts.length - 2];

    res.render("index.ejs", {dogBreed: breedList, randomBreed : result, nameOfRandomBreed: randomBreedName})
    } catch (error) {
        console.log(error.response.data);
        res.status(500).send("Error fetching random breed");
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
