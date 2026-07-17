import { useState } from "react";
import emailjs from "@emailjs/browser";
import api from "../utils/api";

function ContactForm() {

  const contactInfo = [
    {
      label: "Email Us",
      value: "info@omesa.in",
      href: "mailto:info@omesa.in",
      iconClass: "fas fa-envelope",
      bgGradient: "bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7]",
      gradient: "bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7]",
    },
    {
      label: "Call Us",
      value: "+91 98101 86798",
      href: "tel:+919810186798",
      iconClass: "fas fa-phone",
      bgGradient: "bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7]",
      gradient: "bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7]",
    },
    {
      label: "Visit Office",
      value: "Nehru Enclave Chittaranjan Park, New Delhi, Delhi",
      href: "https://www.google.com/maps/dir//Nehru+Enclave+Chittaranjan+Park+New+Delhi,+Delhi",
      iconClass: "fas fa-map-marker-alt",
      bgGradient: "bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7]",
      gradient: "bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7]",
    },
  ];

  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phoneNumber: "",
    subject: "",
    comments: "",
  });

  const [errors, setErrors] = useState({
    firstName: false,
    email: false,
    phoneNumber: false,
    subject: false,
    comments: false,
  });

  // Regex validations
  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,13}$/;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      firstName:
        !formData.firstName.trim() ||
        !nameRegex.test(formData.firstName),

      email:
        !formData.email.trim() ||
        !emailRegex.test(formData.email),

      phoneNumber:
        formData.phoneNumber &&
        !phoneRegex.test(formData.phoneNumber),

      subject: !formData.subject.trim(),

      comments: formData.comments.trim() !== "" && formData.comments.trim().length < 5,
    };

    setErrors(newErrors);

    if (!Object.values(newErrors).some((error) => error)) {
      const templateParams = {
        to_email: "info@omesa.in",
        from_name: formData.firstName,
        from_email: formData.email,
        phone: formData.phoneNumber,
        subject: formData.subject,
        comments: formData.comments,
      };

      // Save contact inquiry locally
      api.post("/api/contact-inquiries", {
        name: formData.firstName,
        email: formData.email,
        subject: formData.subject,
        message: `Phone: ${formData.phoneNumber || "N/A"}\n\n${formData.comments}`
      })
      .then(() => {
        // Trigger EmailJS sending in parallel
        emailjs.send(
          "service_slptbe9",
          "template_0iwhh2m",
          templateParams,
          "AVDJ6-gG1yfcH_At0"
        ).catch((err) => {
          console.error("EmailJS sending failed:", err);
        });

        // Show proper message & refresh the page
        alert("Thank you! Your message has been sent successfully.");
        window.location.reload();
      })
      .catch((err) => {
        console.error("Local database inquiry save error:", err);
        
        // Fallback to attempt EmailJS even if local db save failed
        emailjs.send(
          "service_slptbe9",
          "template_0iwhh2m",
          templateParams,
          "AVDJ6-gG1yfcH_At0"
        )
        .then(() => {
          alert("Thank you! Your message has been sent successfully.");
          window.location.reload();
        })
        .catch((emailErr) => {
          console.error("Email error:", emailErr);
          alert("Failed to send message. Please try again later.");
        })

      });
    }
  };
  return (
    <>
      <div className="bg-slate-950 contact-form flex justify-center items-center">

        <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] 
          mx-auto mt-8 mb-8 bg-slate-950 p-6 text-white border-2 border-gray-900 rounded-md">

          <div className="max-w-6xl mx-auto">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Left Info */}
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-lg p-10 flex flex-col justify-center">

                <h2 className="text-3xl font-[heading] mb-4">
                  Start a Conversation
                </h2>

                <p className="text-blue-100 font-[textFont] mb-8">
                  Ready to build something great? From partnerships to complex solutions, our team is here to help.
                </p>

                <div className="space-y-6 border-t border-blue-500/30 pt-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-white shrink-0 mt-1">
                      <i className="fas fa-map-marker-alt text-lg"></i>
                    </div>
                    <div>
                      <h4 className="text-sm font-[heading] text-blue-200 uppercase tracking-wider font-semibold">Address</h4>
                      <a 
                        href="https://www.google.com/maps/dir//Nehru+Enclave+Chittaranjan+Park+New+Delhi,+Delhi" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-white font-[textFont] text-fs-16 leading-normal mt-1 block hover:text-blue-200 transition-colors"
                      >
                        Nehru Enclave Chittaranjan Park, New Delhi, Delhi
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-white shrink-0 mt-1">
                      <i className="fas fa-phone text-lg"></i>
                    </div>
                    <div>
                      <h4 className="text-sm font-[heading] text-blue-200 uppercase tracking-wider font-semibold">Phone</h4>
                      <a 
                        href="tel:+919810186798" 
                        className="text-white font-[textFont] text-fs-16 leading-normal mt-1 block hover:text-blue-200 transition-colors"
                      >
                        +91 98101 86798
                      </a>
                    </div>
                  </div>
                </div>

              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Name */}
                <div>
                  <label className="block mb-2">Name *</label>
                  <input
                    type="text"
                    className={`w-full p-3 rounded-md bg-slate-800 border ${
                      errors.firstName ? "border-red-500" : "border-gray-600"
                    }`}
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-2">Email *</label>
                  <input
                    type="email"
                    className={`w-full p-3 rounded-md bg-slate-800 border ${
                      errors.email ? "border-red-500" : "border-gray-600"
                    }`}
                    value={formData.email}
                    onChange={(e) =>
                      handleInputChange("email", e.target.value)
                    }
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-2">Phone</label>
                  <input
                    type="text"
                    className={`w-full p-3 rounded-md bg-slate-800 border ${
                      errors.phoneNumber ? "border-red-500" : "border-gray-600"
                    }`}
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block mb-2">Subject *</label>
                  <input
                    type="text"
                    className={`w-full p-3 rounded-md bg-slate-800 border ${
                      errors.subject ? "border-red-500" : "border-gray-600"
                    }`}
                    value={formData.subject}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                  />
                </div>

                {/* Comments */}
                <div>
                  <label className="block mb-2">Comments</label>
                  <textarea
                    className={`w-full p-3 rounded-md bg-slate-800 border ${
                      errors.comments ? "border-red-500" : "border-gray-600"
                    } min-h-[120px]`}
                    value={formData.comments}
                    onChange={(e) =>
                      handleInputChange("comments", e.target.value)
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-full transition"
                >
                  Submit
                </button>

              </form>

            </div>

          </div>

        </div>

      </div>

      {/* Google Map Section */}
      <div className="w-full bg-slate-950 pb-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-36">
        <div className="max-w-6xl mx-auto rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3505.5167527632616!2d77.25141247631375!3d28.539268688463945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3c4d7ec6eeb%3A0xe544c776c5b05a7e!2sNehru%20Enclave%20%2C%20Kalkaji%2C%20Chittaranjan%20Park%2C%20New%20Delhi%2C%20Delhi%20110019!5e0!3m2!1sen!2sin!4v1716164289874!5m2!1sen!2sin" 
            width="100%" 
            height="450" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="filter invert-[90%] hue-rotate-180 opacity-80 hover:opacity-100 transition-all duration-500"
            title="Google Map Location"
          ></iframe>
        </div>
      </div>
    </>
  );
}

export default ContactForm;