import { loadStripe } from "@stripe/stripe-js";
import { countries } from "countries-list";
import { Alert, Button, Label, Select, Spinner, Textarea, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import ReactAudioPlayer from "react-audio-player";
import { MdCancelPresentation, MdEmail } from "react-icons/md";
import { FaRegUser, FaFemale, FaMale } from "react-icons/fa";

import ReactPlayer from "react-player";
import { useSelector } from "react-redux";
import { useParams } from 'react-router-dom';
import Flag from "react-world-flags";




const Speaker = () => {
  const { id } = useParams();
  const [speaker, setSpeaker] = useState(null);

  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState(
    {
      name: currentUser.name,
      email: currentUser.email,
      number: "",
      company: "",
      city: "",
      country: "",
      service: "",
      duration: "",
      specs: "",
    });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);


  const { theme } = useSelector((state) => state.theme);
  const countryOptions = Object.values(countries).map(
    (country) => country.name
  );

  const [showMore, setShowMore] = useState(false);
  const toggleShowMore = () => setShowMore(!showMore);


  useEffect(() => {
    const fetchSpeaker = async () => {
      try {
        const response = await fetch(`/api/speaker/getspeaker/${id}`);
        const data = await response.json();
        setSpeaker(data);
      } catch (error) {
        console.error('Error fetching speaker:', error);
      }
    };

    fetchSpeaker();
  }, [id]);

  const handleChange = (e) => {
    setLoading(false);
    setErrorMessage(null);
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.name || !formData.number || !formData.company || !formData.city || !formData.country || !formData.service || !formData.duration) {
      return setErrorMessage("All fields are required!");
    }
    console.log(formData);
    try {
      setLoading(true);
      setErrorMessage(null);
      const stripe = await loadStripe("pk_test_51PrLnjISagHb5Xr13f8PuJs7EFOwxi5jIXxS4l0DTdT4vGtW6N8m09YOCckaR6vglbqEZitXvNFyoUOhSgR1EpUF00d7wABlaO");
      const response = await fetch("/api/payment/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 100,
        }),
      });
      const session = await response.json();
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error(result.error.message);
      }

      setLoading(false);
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  const getCountryCodeFromName = (countryName) => {
    for (const [code, { name }] of Object.entries(countries)) {
      if (name.toLowerCase() === countryName.toLowerCase()) {
        return code; // Return the country code if a match is found
      }
    }
    return null;
  };

  return (
    <div className="flex lg:flex-row flex-col">
      {speaker ? <div className="container mx-auto p-4 lg:w-2/5 w-full">
        <div className="flex flex-col items-center">
          <div className=" w-full h-72 flex flex-row gap-3 justify-between content-between place-content-between">
            <img
              src={speaker.image}
              alt={speaker.userId.name}
              className="rounded-3xl shadow-2xl w-64 h-64 self-center"
            />
            <div className="w-3/5 h-full flex flex-col justify-center gap-3">
              <p className="text-xl"><FaRegUser className="inline-block" />  {speaker.userId.name}</p>
              <p className="text-xl"><MdEmail className="inline-block" />  {speaker.userId.email}</p>
              <p className="text-xl">{speaker.gender == "male" ? <FaMale className="inline-block" /> : <FaFemale className="inline-block" />} {speaker.gender}</p>
              <p className="text-xl"><Flag code={getCountryCodeFromName(speaker.country)} className="w-8 inline-block" />  {speaker.country}</p>
            </div>
          </div>


          <div className="text-lg self-start mt-3 mb-3">
            <span>About: </span>
            <span className={`line-clamp-3 ${showMore ? 'line-clamp-none' : ''}`}>
              {speaker.about}
            </span>
            <button
              className="text-blue-500 text-sm"
              onClick={toggleShowMore}
            >
              {showMore ? 'Show Less' : 'Show More'}
            </button>
          </div>
          {speaker.video && (
            <div className="self-center mt-3 mb-3">
              <ReactPlayer
                url={speaker.video}
                controls
                loop
                config={{
                  youtube: {
                    playerVars: {
                      modestbranding: 1,
                      rel: 0,
                      showinfo: 0,
                      disablekb: 1,
                    },
                  },
                }}
                className="react-player-form"
              />
            </div>
          )}
          <div className="w-full mt-5">
            <h3 className="text-2xl mb-2">Example Audio</h3>
            <div className="flex flex-wrap justify-between">
              {speaker.demos.length > 0 ? (
                speaker.demos.map((demo, index) => (
                  <ReactAudioPlayer
                    key={index}
                    src={demo}
                    controls
                    className="w-[350px] mb-4"
                  />
                ))
              ) : (
                <p>No demos available</p>
              )}
            </div>
          </div>
        </div>
      </div>
        : (<>
          <Spinner size="sm" />
          <span className="pl-3">Loading...</span>
        </>)
      }
      <div
        className="flex w-1/2 h-min self-center m-4 p-10 max-w-2xl flex-col md:flex-row md:items-center gap-10
				bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
        <div className="flex-1 px-5">
          <h1 className="flex self-center justify-center text-3xl font-semibold mb-6">Fill out the Form</h1>
          <form
            className={`flex flex-col gap-4 ${theme}`}
            onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <Label value="Name" />
              <TextInput
                type="text"
                placeholder="Name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label value="Email" />
              <TextInput
                type="text"
                placeholder="Email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label value="Phone" />
              <TextInput
                type="text"
                placeholder="Number"
                id="number"
                value={formData.number}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label value="Company" />
              <TextInput
                type="text"
                placeholder="Company"
                id="company"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-row content-between justify-between">
              <div className="flex flex-col gap-1 w-1/2">
                <Label value="City" />
                <TextInput
                  type="text"
                  placeholder="City"
                  id="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-1 w-2/5">
                <Label value="Country" />
                <Select
                  className="w-full"
                  value={formData.country}
                  id="country"
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select a Country
                  </option>
                  {countryOptions.map((country, index) => (
                    <option key={index} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex flex-row content-between justify-between">
              <div className="flex flex-col gap-1 w-2/5">
                <Label value="Type of Service" />
                <Select
                  className="w-full"
                  id="service"
                  value={formData.service}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select a Service
                  </option>
                  <option value="voiceOver">Voice Over</option>
                  <option value="womenVoice">Video Debbing</option>
                  <option value="holdswitch">Message on HOLD/SWITCH</option>
                  <option value="auditoryLogos">Auditory Logos (Branding)</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1 w-2/5">
                <Label value="Audio Duration" />
                <Select
                  className="w-full"
                  id="duration"
                  value={formData.duration}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select a Duration
                  </option>
                  <option value="10_20_sec">Voice for 10~20 sec </option>
                  <option value="30_40_sec">Voice for 30~40 sec</option>
                  <option value="1_min">Voice for 1 min</option>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label value="Specs" />
              <Textarea
                rows={3}
                placeholder="Optional additional information (length, voice type, broadcast medium, etc.)."
                id="specs"
                value={formData.specs}
                onChange={handleChange}
              />
            </div>
            <Button
              gradientDuoTone="purpleToBlue"
              type="submit"
              className="uppercase focus:ring-1 mt-1"
              disabled={loading || errorMessage}>
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Next"
              )}
            </Button>
          </form>
          {errorMessage && (
            <div className="flex items-center gap-1 mt-4">
              <Alert className="flex-auto" color="failure" withBorderAccent>
                <div className="flex justify-between">
                  <span>{errorMessage}</span>
                  <span className="w-5 h-5">
                    <MdCancelPresentation
                      className="cursor-pointer w-6 h-6"
                      onClick={() => setErrorMessage(null)}
                    />
                  </span>
                </div>
              </Alert>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Speaker;
