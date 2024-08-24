import Speaker from "../models/speaker.model.js";

const dummySpeakers = [
  {
    userId: "64b82e8e458f4c5d9a0d6b77",
    video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    image: "https://via.placeholder.com/150?text=Speaker+1",
    gender: "female",
    country: "United States",
    demos: [
      "https://www.example.com/demo1.mp3",
      "https://www.example.com/demo2.mp3",
    ],
  },
  {
    userId: "64b82e8e458f4c5d9a0d6b78",
    video: "https://www.youtube.com/watch?v=3tmd-ClpJxA",
    image: "https://via.placeholder.com/150?text=Speaker+2",
    gender: "male",
    country: "Canada",
    demos: [
      "https://www.example.com/demo3.mp3",
      "https://www.example.com/demo4.mp3",
      "https://www.example.com/demo5.mp3",
    ],
  },
  {
    userId: "64b82e8e458f4c5d9a0d6b79",
    video: "https://www.youtube.com/watch?v=2L3fpx-2wH4",
    image: "https://via.placeholder.com/150?text=Speaker+3",
    gender: "female",
    country: "United Kingdom",
    demos: ["https://www.example.com/demo6.mp3"],
  },
  {
    userId: "64b82e8e458f4c5d9a0d6b80",
    video: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    image: "https://via.placeholder.com/150?text=Speaker+4",
    gender: "male",
    country: "Australia",
    demos: [
      "https://www.example.com/demo7.mp3",
      "https://www.example.com/demo8.mp3",
    ],
  },
  {
    userId: "64b82e8e458f4c5d9a0d6b81",
    video: "https://www.youtube.com/watch?v=5Nv0J6aM_Rs",
    image: "https://via.placeholder.com/150?text=Speaker+5",
    gender: "female",
    country: "Germany",
    demos: ["https://www.example.com/demo9.mp3"],
  },
  {
    userId: "64b82e8e458f4c5d9a0d6b82",
    video: "https://www.youtube.com/watch?v=7t7LkOrV3_4",
    image: "https://via.placeholder.com/150?text=Speaker+6",
    gender: "male",
    country: "France",
    demos: [
      "https://www.example.com/demo10.mp3",
      "https://www.example.com/demo11.mp3",
    ],
  },
  {
    userId: "64b82e8e458f4c5d9a0d6b83",
    video: "https://www.youtube.com/watch?v=9tQ2MfPSr3Q",
    image: "https://via.placeholder.com/150?text=Speaker+7",
    gender: "female",
    country: "Italy",
    demos: ["https://www.example.com/demo12.mp3"],
  },
  {
    userId: "64b82e8e458f4c5d9a0d6b84",
    video: "https://www.youtube.com/watch?v=9mMnbc4Edj4",
    image: "https://via.placeholder.com/150?text=Speaker+8",
    gender: "male",
    country: "Spain",
    demos: [
      "https://www.example.com/demo13.mp3",
      "https://www.example.com/demo14.mp3",
    ],
  },
  {
    userId: "64b82e8e458f4c5d9a0d6b85",
    video: "https://www.youtube.com/watch?v=mb3VeUWAHjI",
    image: "https://via.placeholder.com/150?text=Speaker+9",
    gender: "female",
    country: "Netherlands",
    demos: ["https://www.example.com/demo15.mp3"],
  },
  {
    userId: "64b82e8e458f4c5d9a0d6b86",
    video: "https://www.youtube.com/watch?v=9BDSJ08UM10",
    image: "https://via.placeholder.com/150?text=Speaker+10",
    gender: "male",
    country: "Sweden",
    demos: [
      "https://www.example.com/demo16.mp3",
      "https://www.example.com/demo17.mp3",
    ],
  },
];

export const getSpeakers = async (req, res) => {
  try {
    var { voiceType, country } = req.query;
    if(voiceType === 'all') {
      voiceType = null;
    }
    if(country === 'all') {
      country = null;
    }


    const query = {};

    if (voiceType) {
      query.gender = voiceType === "womenVoice" ? "female" : "male";
    }
    if (country) {
      query.country = country;
    }

    const speakers = await Speaker.find(query).limit(9);

    res.json(dummySpeakers);
  } catch (error) {
    console.error("Failed to fetch speakers", error);
    res.status(500).json({ error: "Failed to fetch speakers" });
  }
};
