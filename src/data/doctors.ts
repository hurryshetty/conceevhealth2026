import doctorPriya from "@/assets/doctor-priya.jpg";
import doctorAnita from "@/assets/doctor-anita.jpg";
import doctorMeera from "@/assets/doctor-meera.jpg";
import doctorKavitha from "@/assets/doctor-kavitha.jpg";
import doctorSunita from "@/assets/doctor-sunita.jpg";
import doctorLakshmi from "@/assets/doctor-lakshmi.jpg";
import doctorDivya from "@/assets/doctor-divya.jpg";
import doctorRashmi from "@/assets/doctor-rashmi.jpg";
import doctorPadma from "@/assets/doctor-padma.jpg";
import doctorSneha from "@/assets/doctor-sneha.jpg";
import doctorAsha from "@/assets/doctor-asha.jpg";
import doctorNandini from "@/assets/doctor-nandini.jpg";
import testimonialPriya from "@/assets/testimonial-priya.jpg";
import testimonialAnanya from "@/assets/testimonial-ananya.jpg";
import testimonialDeepa from "@/assets/testimonial-deepa.jpg";
import testimonialKavitha from "@/assets/testimonial-kavitha.jpg";
import testimonialMeera from "@/assets/testimonial-meera.jpg";

export interface DoctorReview {
  name: string;
  area: string;
  rating: number;
  quote: string;
  image: string;
}

export interface Doctor {
  slug: string;
  name: string;
  designation: string;
  experience: string;
  image: string;
  bio: string;
  qualifications: string[];
  specializations: string[];
  surgeries: string[];
  hospitals: string[];
  cities: string[];
  languages: string[];
  consultationFee: string;
  reviews: DoctorReview[];
}

export const doctors: Doctor[] = [
  {
    slug: "dr-priya-sharma",
    name: "Dr. Priya Sharma",
    designation: "Senior Fertility Specialist",
    experience: "15+ years",
    image: doctorPriya,
    bio: "Dr. Priya Sharma is one of South India's leading fertility specialists with over 15 years of experience in reproductive medicine. She has helped over 2,000 couples achieve their dream of parenthood through advanced IVF and IUI techniques. Known for her compassionate approach and high success rates, Dr. Sharma combines cutting-edge medical technology with personalized patient care.",
    qualifications: [
      "MBBS – Bangalore Medical College",
      "MD (Obstetrics & Gynaecology) – AIIMS, New Delhi",
      "Fellowship in Reproductive Medicine – Singapore General Hospital",
      "Certified in Advanced Laparoscopic Surgery",
    ],
    specializations: ["In-Vitro Fertilization (IVF)", "Intrauterine Insemination (IUI)", "Egg Freezing & Fertility Preservation"],
    surgeries: ["IVF", "IUI", "Egg Freezing", "ICSI", "Fertility Assessment"],
    hospitals: ["Apollo Hospitals", "Manipal Hospital"],
    cities: ["Bangalore"],
    languages: ["English", "Hindi", "Kannada"],
    consultationFee: "₹800",
    reviews: [
      { name: "Priya S.", area: "Whitefield, Bangalore", rating: 4.9, quote: "Dr. Sharma made our IVF journey so much easier. Her patience and expertise gave us confidence throughout the process. We are now proud parents thanks to her!", image: testimonialPriya },
      { name: "Deepa M.", area: "HSR Layout, Bangalore", rating: 4.8, quote: "After two failed IVF attempts elsewhere, Dr. Priya's personalized approach finally worked for us. She truly cares about her patients.", image: testimonialDeepa },
      { name: "Meera L.", area: "Koramangala, Bangalore", rating: 5.0, quote: "The best fertility specialist in Bangalore. Dr. Sharma explains everything clearly and makes you feel at ease during a very emotional journey.", image: testimonialMeera },
    ],
  },
  {
    slug: "dr-anita-reddy",
    name: "Dr. Anita Reddy",
    designation: "Consultant Gynecologist",
    experience: "12+ years",
    image: doctorAnita,
    bio: "Dr. Anita Reddy is a highly skilled gynecologist specializing in minimally invasive surgical procedures. With 12+ years of experience, she has performed over 3,000 successful surgeries including hysterectomies, fibroid removals, and laparoscopic procedures. She is recognized for her precision in surgery and dedication to ensuring the fastest recovery times for her patients.",
    qualifications: [
      "MBBS – Osmania Medical College, Hyderabad",
      "MS (Obstetrics & Gynaecology) – JIPMER, Puducherry",
      "DNB in Gynaecological Endoscopy",
      "Fellowship in Minimally Invasive Surgery – Germany",
    ],
    specializations: ["Laparoscopic Hysterectomy", "Fibroid Removal (Myomectomy)", "Endometriosis Treatment"],
    surgeries: ["Hysterectomy", "Fibroid Surgery", "Laparoscopy", "Ovarian Cyst Removal", "Endometriosis"],
    hospitals: ["Fortis Healthcare", "Manipal Hospital", "Rainbow Hospital"],
    cities: ["Hyderabad", "Bangalore"],
    languages: ["English", "Hindi", "Telugu"],
    consultationFee: "₹700",
    reviews: [
      { name: "Ananya R.", area: "Kukatpally, Hyderabad", rating: 4.7, quote: "Dr. Anita performed my hysterectomy laparoscopically. I was back on my feet in just 5 days. Her skill is truly remarkable.", image: testimonialAnanya },
      { name: "Kavitha J.", area: "Gachibowli, Hyderabad", rating: 4.8, quote: "I was terrified of surgery, but Dr. Reddy explained every step and made me feel safe. The fibroid removal went perfectly.", image: testimonialKavitha },
      { name: "Deepa M.", area: "HSR Layout, Bangalore", rating: 4.9, quote: "Dr. Anita is extremely thorough. She diagnosed my endometriosis when two other doctors missed it. Grateful for her expertise.", image: testimonialDeepa },
    ],
  },
  {
    slug: "dr-meera-krishnan",
    name: "Dr. Meera Krishnan",
    designation: "Obstetrician & Surgeon",
    experience: "18+ years",
    image: doctorMeera,
    bio: "Dr. Meera Krishnan is a senior obstetrician and surgeon with over 18 years of experience in managing high-risk pregnancies and performing complex surgical deliveries. She has delivered over 5,000 babies and is known for her calm demeanor during emergencies. Her expertise in both normal and surgical deliveries makes her one of the most sought-after obstetricians in the region.",
    qualifications: [
      "MBBS – Madras Medical College, Chennai",
      "MD (Obstetrics & Gynaecology) – CMC Vellore",
      "FRCOG (Fellow of the Royal College of Obstetricians, UK)",
      "Advanced Training in High-Risk Obstetrics – Johns Hopkins, USA",
    ],
    specializations: ["High-Risk Pregnancy Management", "Cesarean Section (C-Section)", "Normal Delivery Care"],
    surgeries: ["C-Section", "Normal Delivery", "High-Risk Pregnancy", "Prenatal Care"],
    hospitals: ["Narayana Health", "Rainbow Hospital"],
    cities: ["Bangalore", "Hyderabad"],
    languages: ["English", "Hindi", "Tamil", "Kannada"],
    consultationFee: "₹900",
    reviews: [
      { name: "Meera L.", area: "Koramangala, Bangalore", rating: 4.9, quote: "Dr. Meera handled my high-risk pregnancy with such care and expertise. My baby and I are healthy thanks to her. She's an angel.", image: testimonialMeera },
      { name: "Priya S.", area: "Whitefield, Bangalore", rating: 4.8, quote: "I had a very smooth C-section with Dr. Krishnan. She was with me through every step and made the entire experience comfortable.", image: testimonialPriya },
      { name: "Ananya R.", area: "Kukatpally, Hyderabad", rating: 5.0, quote: "Dr. Meera is the most caring doctor I've ever met. She answered all my questions patiently and ensured a safe delivery.", image: testimonialAnanya },
    ],
  },
  {
    slug: "dr-kavitha-nair",
    name: "Dr. Kavitha Nair",
    designation: "Fertility & IVF Specialist",
    experience: "14+ years",
    image: doctorKavitha,
    bio: "Dr. Kavitha Nair is a renowned fertility specialist with 14+ years of expertise in assisted reproductive technology. She has pioneered several advanced IVF protocols at her center and has a remarkable success rate of over 55% in IVF cycles. Her patient-first approach and deep knowledge of reproductive endocrinology make her a top choice for couples seeking fertility treatment.",
    qualifications: [
      "MBBS – Kasturba Medical College, Manipal",
      "MD (Obstetrics & Gynaecology) – KMC Manipal",
      "Fellowship in Reproductive Endocrinology – London",
      "Diploma in Advanced Embryology",
    ],
    specializations: ["IVF & ICSI Treatment", "Recurrent Implantation Failure", "Male Factor Infertility Management"],
    surgeries: ["IVF", "ICSI", "IUI", "Egg Freezing", "Donor Programs"],
    hospitals: ["Apollo Hospitals", "Cloudnine Hospital"],
    cities: ["Bangalore"],
    languages: ["English", "Hindi", "Malayalam", "Kannada"],
    consultationFee: "₹850",
    reviews: [
      { name: "Deepa M.", area: "HSR Layout, Bangalore", rating: 4.9, quote: "Dr. Kavitha's expertise in IVF is outstanding. After years of trying, we finally have our miracle baby. Forever grateful!", image: testimonialDeepa },
      { name: "Priya S.", area: "Whitefield, Bangalore", rating: 4.8, quote: "She took the time to explain every step of the IVF process. Her calm demeanor made a stressful journey much easier.", image: testimonialPriya },
      { name: "Kavitha J.", area: "Gachibowli, Hyderabad", rating: 4.7, quote: "Dr. Nair's approach to fertility treatment is very holistic. She considers both physical and emotional aspects.", image: testimonialKavitha },
    ],
  },
  {
    slug: "dr-sunita-rao",
    name: "Dr. Sunita Rao",
    designation: "Senior Gynecologic Surgeon",
    experience: "20+ years",
    image: doctorSunita,
    bio: "Dr. Sunita Rao brings over two decades of surgical excellence in gynecology. She is one of the most experienced laparoscopic surgeons in South India with over 5,000 successful minimally invasive procedures. Known for handling complex cases that other surgeons refer, she specializes in large fibroids, severe endometriosis, and reconstructive gynecologic surgery.",
    qualifications: [
      "MBBS – Gandhi Medical College, Hyderabad",
      "MS (Obstetrics & Gynaecology) – NIMS, Hyderabad",
      "Fellowship in Advanced Laparoscopy – France",
      "FICS (Fellow of the International College of Surgeons)",
    ],
    specializations: ["Advanced Laparoscopic Surgery", "Complex Fibroid Removal", "Reconstructive Gynecologic Surgery"],
    surgeries: ["Hysterectomy", "Myomectomy", "Laparoscopy", "Endometriosis Surgery", "Pelvic Floor Repair"],
    hospitals: ["KIMS Hospital", "Yashoda Hospital", "Care Hospital"],
    cities: ["Hyderabad"],
    languages: ["English", "Hindi", "Telugu"],
    consultationFee: "₹1,000",
    reviews: [
      { name: "Ananya R.", area: "Kukatpally, Hyderabad", rating: 5.0, quote: "Dr. Sunita removed my large fibroids laparoscopically when other doctors said only open surgery was possible. She's truly a master surgeon.", image: testimonialAnanya },
      { name: "Kavitha J.", area: "Gachibowli, Hyderabad", rating: 4.9, quote: "20 years of experience shows in every interaction. Dr. Rao is thorough, skilled, and deeply caring.", image: testimonialKavitha },
      { name: "Meera L.", area: "Koramangala, Bangalore", rating: 4.8, quote: "I traveled from Bangalore to Hyderabad specifically for Dr. Sunita. Worth every bit of the effort.", image: testimonialMeera },
    ],
  },
  {
    slug: "dr-lakshmi-venkatesh",
    name: "Dr. Lakshmi Venkatesh",
    designation: "Maternal-Fetal Medicine Specialist",
    experience: "16+ years",
    image: doctorLakshmi,
    bio: "Dr. Lakshmi Venkatesh specializes in maternal-fetal medicine with 16+ years of experience managing complicated pregnancies. She is an expert in prenatal diagnostics, fetal therapy, and managing pregnancies with pre-existing medical conditions. Her expertise has saved countless high-risk pregnancies and she is a trusted name in perinatology across Karnataka.",
    qualifications: [
      "MBBS – St. John's Medical College, Bangalore",
      "MD (Obstetrics & Gynaecology) – NIMHANS affiliate",
      "DM (Maternal-Fetal Medicine) – AIIMS, New Delhi",
      "Certification in Fetal Echocardiography",
    ],
    specializations: ["High-Risk Pregnancy Care", "Fetal Medicine & Diagnostics", "Prenatal Screening & Counseling"],
    surgeries: ["C-Section", "Cerclage", "Prenatal Procedures", "High-Risk Delivery"],
    hospitals: ["Manipal Hospital", "Narayana Health"],
    cities: ["Bangalore"],
    languages: ["English", "Hindi", "Kannada", "Tamil"],
    consultationFee: "₹950",
    reviews: [
      { name: "Priya S.", area: "Whitefield, Bangalore", rating: 5.0, quote: "Dr. Lakshmi managed my twin pregnancy with gestational diabetes flawlessly. Both my babies were delivered safely.", image: testimonialPriya },
      { name: "Deepa M.", area: "HSR Layout, Bangalore", rating: 4.9, quote: "Her knowledge of fetal medicine is incredible. She detected a potential issue early and guided us through it perfectly.", image: testimonialDeepa },
      { name: "Meera L.", area: "Koramangala, Bangalore", rating: 4.8, quote: "Dr. Venkatesh is a lifesaver – literally. Her expertise in high-risk pregnancies is unmatched in Bangalore.", image: testimonialMeera },
    ],
  },
  {
    slug: "dr-divya-menon",
    name: "Dr. Divya Menon",
    designation: "Reproductive Endocrinologist",
    experience: "10+ years",
    image: doctorDivya,
    bio: "Dr. Divya Menon is a young and dynamic reproductive endocrinologist with 10+ years of focused experience in fertility treatment. She completed her training at some of India's and Europe's best institutions and brings a modern, evidence-based approach to fertility care. She is especially known for her work with PCOS-related infertility and natural cycle IVF.",
    qualifications: [
      "MBBS – Government Medical College, Trivandrum",
      "MD (Obstetrics & Gynaecology) – JIPMER, Puducherry",
      "Fellowship in Reproductive Endocrinology – Barcelona, Spain",
      "Certification in Natural Cycle IVF",
    ],
    specializations: ["PCOS-Related Infertility", "Natural Cycle IVF", "Reproductive Endocrinology"],
    surgeries: ["IVF", "IUI", "Ovulation Induction", "Fertility Assessment", "PCOS Treatment"],
    hospitals: ["Fortis Healthcare", "Cloudnine Hospital"],
    cities: ["Bangalore", "Hyderabad"],
    languages: ["English", "Hindi", "Malayalam", "Kannada"],
    consultationFee: "₹750",
    reviews: [
      { name: "Kavitha J.", area: "Gachibowli, Hyderabad", rating: 4.8, quote: "Dr. Divya's natural cycle IVF approach worked for me when conventional methods didn't. She thinks outside the box.", image: testimonialKavitha },
      { name: "Ananya R.", area: "Kukatpally, Hyderabad", rating: 4.7, quote: "Very modern and research-backed approach. Dr. Menon stays updated with the latest in fertility science.", image: testimonialAnanya },
      { name: "Deepa M.", area: "HSR Layout, Bangalore", rating: 4.9, quote: "She managed my PCOS and helped me conceive naturally after proper treatment. Incredible doctor!", image: testimonialDeepa },
    ],
  },
  {
    slug: "dr-rashmi-patil",
    name: "Dr. Rashmi Patil",
    designation: "Gynecologic Oncologist",
    experience: "13+ years",
    image: doctorRashmi,
    bio: "Dr. Rashmi Patil is a specialist gynecologic oncologist with 13+ years of experience in treating gynecological cancers and complex pelvic conditions. She combines oncological expertise with advanced laparoscopic techniques to offer comprehensive treatment for conditions ranging from ovarian cysts to early-stage cervical and endometrial cancers.",
    qualifications: [
      "MBBS – KLE University, Belgaum",
      "MS (Obstetrics & Gynaecology) – KMC Manipal",
      "MCh (Gynecologic Oncology) – Tata Memorial Hospital, Mumbai",
      "Advanced Training in Robotic Surgery",
    ],
    specializations: ["Gynecologic Oncology", "Ovarian Cyst Management", "Cervical & Endometrial Cancer Treatment"],
    surgeries: ["Ovarian Cyst Removal", "Radical Hysterectomy", "Laparoscopic Staging", "Pelvic Surgery"],
    hospitals: ["Apollo Hospitals", "KIMS Hospital"],
    cities: ["Bangalore", "Hyderabad"],
    languages: ["English", "Hindi", "Kannada", "Marathi"],
    consultationFee: "₹1,100",
    reviews: [
      { name: "Meera L.", area: "Koramangala, Bangalore", rating: 5.0, quote: "Dr. Rashmi diagnosed my condition early and performed surgery with such precision. I'm cancer-free today because of her.", image: testimonialMeera },
      { name: "Priya S.", area: "Whitefield, Bangalore", rating: 4.9, quote: "She handled a very scary situation with utmost professionalism and compassion. My ovarian cyst surgery was seamless.", image: testimonialPriya },
      { name: "Ananya R.", area: "Kukatpally, Hyderabad", rating: 4.8, quote: "Dr. Patil is one of the best oncology surgeons. She gave me hope when I needed it the most.", image: testimonialAnanya },
    ],
  },
  {
    slug: "dr-padma-iyer",
    name: "Dr. Padma Iyer",
    designation: "Senior Obstetrician",
    experience: "22+ years",
    image: doctorPadma,
    bio: "Dr. Padma Iyer is one of the most experienced obstetricians in Hyderabad with 22+ years of practice. She has managed over 8,000 deliveries including some of the most complex high-risk cases in the region. Known for her wisdom, steady hands, and reassuring presence, she is a mentor to many young doctors and a trusted name among families.",
    qualifications: [
      "MBBS – Andhra Medical College, Visakhapatnam",
      "MD (Obstetrics & Gynaecology) – Osmania Medical College",
      "FRCOG (Fellow of the Royal College, UK)",
      "Diploma in Advanced Obstetric Ultrasound",
    ],
    specializations: ["Complex Delivery Management", "Gestational Diabetes Care", "Postpartum Recovery Programs"],
    surgeries: ["C-Section", "Normal Delivery", "Instrumental Delivery", "Emergency Obstetrics"],
    hospitals: ["Yashoda Hospital", "Care Hospital", "Rainbow Hospital"],
    cities: ["Hyderabad"],
    languages: ["English", "Hindi", "Telugu", "Tamil"],
    consultationFee: "₹900",
    reviews: [
      { name: "Kavitha J.", area: "Gachibowli, Hyderabad", rating: 5.0, quote: "Dr. Padma delivered both my children. Her experience and calm nature made even my emergency C-section feel manageable.", image: testimonialKavitha },
      { name: "Ananya R.", area: "Kukatpally, Hyderabad", rating: 4.9, quote: "22 years of experience speaks for itself. Dr. Iyer is a living legend in obstetrics in Hyderabad.", image: testimonialAnanya },
      { name: "Deepa M.", area: "HSR Layout, Bangalore", rating: 4.8, quote: "I specifically chose Hyderabad for delivery because of Dr. Padma. Best decision ever.", image: testimonialDeepa },
    ],
  },
  {
    slug: "dr-sneha-kulkarni",
    name: "Dr. Sneha Kulkarni",
    designation: "Fertility & Laparoscopic Surgeon",
    experience: "9+ years",
    image: doctorSneha,
    bio: "Dr. Sneha Kulkarni is a dynamic young surgeon who combines fertility expertise with advanced laparoscopic surgical skills. With 9+ years of focused practice, she specializes in treating conditions like endometriosis and PCOS that affect fertility. Her dual expertise allows her to offer both surgical and non-surgical fertility solutions under one roof.",
    qualifications: [
      "MBBS – JSS Medical College, Mysore",
      "MS (Obstetrics & Gynaecology) – Bangalore Medical College",
      "Fellowship in Reproductive Medicine – Kiel, Germany",
      "Diploma in Minimal Access Surgery",
    ],
    specializations: ["Endometriosis & Fertility", "PCOS Surgical Management", "Fertility-Preserving Laparoscopy"],
    surgeries: ["Laparoscopy", "IVF", "IUI", "Endometriosis Surgery", "Cystectomy"],
    hospitals: ["Manipal Hospital", "Fortis Healthcare"],
    cities: ["Bangalore"],
    languages: ["English", "Hindi", "Kannada"],
    consultationFee: "₹700",
    reviews: [
      { name: "Priya S.", area: "Whitefield, Bangalore", rating: 4.8, quote: "Dr. Sneha successfully treated my endometriosis and I conceived within 6 months. Her dual expertise is rare and valuable.", image: testimonialPriya },
      { name: "Meera L.", area: "Koramangala, Bangalore", rating: 4.7, quote: "Young but incredibly skilled. Dr. Kulkarni's laparoscopic surgery had me back to work in just a week.", image: testimonialMeera },
      { name: "Deepa M.", area: "HSR Layout, Bangalore", rating: 4.9, quote: "She takes a very modern, evidence-based approach. I felt confident in her care throughout my treatment.", image: testimonialDeepa },
    ],
  },
  {
    slug: "dr-asha-pillai",
    name: "Dr. Asha Pillai",
    designation: "Consultant Gynecologist & Urogynaecologist",
    experience: "17+ years",
    image: doctorAsha,
    bio: "Dr. Asha Pillai is a senior gynecologist with a sub-specialization in urogynaecology. With 17+ years of experience, she excels in treating pelvic floor disorders, urinary incontinence, and prolapse conditions alongside general gynecological care. She is one of the few urogynaecologists in the region and attracts patients from across South India.",
    qualifications: [
      "MBBS – Government Medical College, Kozhikode",
      "MD (Obstetrics & Gynaecology) – Medical College Trivandrum",
      "Fellowship in Urogynaecology – King's College London",
      "MRCOG (Member of the Royal College, UK)",
    ],
    specializations: ["Urogynaecology & Pelvic Floor Repair", "Urinary Incontinence Treatment", "Uterine Prolapse Surgery"],
    surgeries: ["Prolapse Repair", "Hysterectomy", "Pelvic Floor Surgery", "Incontinence Surgery"],
    hospitals: ["Apollo Hospitals", "Narayana Health"],
    cities: ["Bangalore", "Hyderabad"],
    languages: ["English", "Hindi", "Malayalam", "Kannada", "Telugu"],
    consultationFee: "₹850",
    reviews: [
      { name: "Kavitha J.", area: "Gachibowli, Hyderabad", rating: 4.9, quote: "Dr. Asha treated my prolapse condition that I had been suffering with for years. She changed my quality of life completely.", image: testimonialKavitha },
      { name: "Ananya R.", area: "Kukatpally, Hyderabad", rating: 4.8, quote: "Finding a urogynaecologist was difficult until I found Dr. Pillai. Her expertise is rare and much needed.", image: testimonialAnanya },
      { name: "Meera L.", area: "Koramangala, Bangalore", rating: 5.0, quote: "Dr. Asha is compassionate and extremely knowledgeable. She explained my condition thoroughly and the surgery was perfect.", image: testimonialMeera },
    ],
  },
  {
    slug: "dr-nandini-hegde",
    name: "Dr. Nandini Hegde",
    designation: "Consultant Obstetrician & Gynecologist",
    experience: "11+ years",
    image: doctorNandini,
    bio: "Dr. Nandini Hegde is a well-rounded obstetrician and gynecologist with 11+ years of experience across maternity care and gynecological surgeries. She is known for her holistic approach to women's health, combining surgical skill with preventive care and wellness counseling. She has a loyal patient base who appreciate her thoroughness and warm bedside manner.",
    qualifications: [
      "MBBS – M.S. Ramaiah Medical College, Bangalore",
      "MD (Obstetrics & Gynaecology) – St. John's Medical College",
      "Fellowship in Minimally Invasive Surgery – Mumbai",
      "Certification in Prenatal Yoga & Wellness",
    ],
    specializations: ["Comprehensive Maternity Care", "Preventive Gynecological Wellness", "Minimally Invasive Gynecologic Surgery"],
    surgeries: ["C-Section", "Normal Delivery", "Laparoscopy", "Fibroid Removal", "PCOS Treatment"],
    hospitals: ["Cloudnine Hospital", "Rainbow Hospital", "Manipal Hospital"],
    cities: ["Bangalore", "Hyderabad"],
    languages: ["English", "Hindi", "Kannada", "Telugu"],
    consultationFee: "₹750",
    reviews: [
      { name: "Deepa M.", area: "HSR Layout, Bangalore", rating: 4.9, quote: "Dr. Nandini was with me throughout my pregnancy journey. Her holistic approach made my delivery experience wonderful.", image: testimonialDeepa },
      { name: "Priya S.", area: "Whitefield, Bangalore", rating: 4.8, quote: "She combines modern medicine with wellness practices. My postpartum recovery was much smoother thanks to her guidance.", image: testimonialPriya },
      { name: "Kavitha J.", area: "Gachibowli, Hyderabad", rating: 4.7, quote: "Dr. Hegde is thorough and patient. She never rushes through appointments and genuinely cares about your health.", image: testimonialKavitha },
    ],
  },
];

export const getDoctorBySlug = (slug: string) => doctors.find((d) => d.slug === slug);
