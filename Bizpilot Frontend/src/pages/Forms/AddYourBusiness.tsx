import { useState } from "react";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

import Label from "../../components/form/Label";
import TextArea from "../../components/form/input/TextArea";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";


export default function AddYourBusiness() {


  const [message, setMessage] = useState("");


  const businessOptions = [
    {
      value: "shop",
      label: "Shop"
    },
    {
      value: "service",
      label: "Service"
    },
    {
      value: "company",
      label: "Company"
    }
  ];



  const handleSubmit = () => {

    console.log("Form Submitted");

  };



  return (
    <div>


      <PageMeta
        title="Add Your Business"
        description="Add your business form page"
      />


      <PageBreadcrumb pageTitle="Add Your Business" />



      <ComponentCard title="Business Details">


        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">



          {/* LEFT SIDE */}

          <div className="space-y-6">


            <div>

              <Label htmlFor="businessName">
                Business Name
              </Label>


              <Input
                type="text"
                id="businessName"
                placeholder="Enter business name"
              />

            </div>




            <div>

              <Label htmlFor="phone">
                Phone No
              </Label>


              <Input
                type="text"
                id="phone"
                placeholder="Enter phone number"
              />

            </div>





            <div>

              <Label>
                Description
              </Label>


              <TextArea

                value={message}

                onChange={(value) => setMessage(value)}

                rows={5}

              />


            </div>




          </div>






          {/* RIGHT SIDE */}

          <div className="space-y-6">



            <div>

              <Label>
                Business Category
              </Label>


              <Select

                options={businessOptions}

                placeholder="Select category"

                onChange={(value) => console.log(value)}

                className="dark:bg-dark-900"

              />


            </div>






            <div>

              <Label>
                Email Address
              </Label>


              <Input

                type="email"

                placeholder="Enter email"

              />


            </div>






            <div>

              <Label>
                Whatsapp No
              </Label>


              <Input

                type="number"

                placeholder="Enter whatsapp number"

              />


            </div>






            <div>

              <Label>
                Business Location
              </Label>


              <Input

                type="text"

                placeholder="Enter business location"

              />


            </div>




          </div>




        </div>





        {/* SUBMIT BUTTON */}

        {/* SUBMIT BUTTON */}

        <div className="flex justify-start mt-8">

          <button
            type="button"
            onClick={handleSubmit}
            className="
      px-6
      py-3
      rounded-lg
      bg-brand-500
      text-white
      font-medium
      hover:bg-brand-600
      transition
    "
          >
            Submit
          </button>

        </div>



      </ComponentCard>



    </div>
  );
}