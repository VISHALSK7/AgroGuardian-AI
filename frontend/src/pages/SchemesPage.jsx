import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ExternalLink, Search, ChevronDown, IndianRupee, CheckCircle, Clock, X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';

const STATES = ['All States', 'Karnataka', 'Maharashtra', 'Punjab', 'Tamil Nadu', 'Andhra Pradesh', 'UP', 'Rajasthan', 'Gujarat', 'West Bengal'];

const SCHEMES = [
  {
    id: 1, name: 'PM-KISAN Samman Nidhi', name_kn: 'ಪಿಎಂ-ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ', name_hi: 'पीएम-किसान सम्मान निधि',
    state: 'All States', ministry: 'Ministry of Agriculture', ministry_kn: 'ಕೃಷಿ ಸಚಿವಾಲಯ', ministry_hi: 'कृषि मंत्रालय',
    amount: '₹6,000 per year, distributed in three equal installments of ₹2,000 directly into the farmer\'s bank account.',
    amount_kn: 'ವರ್ಷಕ್ಕೆ ₹6,000, ಮೂರು ಸಮಾನ ಕಂತುಗಳಲ್ಲಿ ತಲಾ ₹2,000 ರಂತೆ ನೇರವಾಗಿ ರೈತರ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆ ಮಾಡಲಾಗುತ್ತದೆ.',
    amount_hi: 'प्रति वर्ष ₹6,000, ₹2,000 की तीन समान किश्तों में सीधे किसान के बैंक खाते में वितरित।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Income Support',
    desc: 'Direct income support of ₹6,000 per year to all landholding farmer families to help them purchase agricultural inputs.',
    desc_kn: 'ಎಲ್ಲಾ ಭೂಹಿಡುವಳಿ ಹೊಂದಿರುವ ರೈತ ಕುಟುಂಬಗಳಿಗೆ ಕೃಷಿ ಪರಿಕರಗಳನ್ನು ಖರೀದಿಸಲು ಸಹಾಯ ಮಾಡಲು ವರ್ಷಕ್ಕೆ ₹6,000 ನೇರ ಆದಾಯದ ಬೆಂಬಲ.',
    desc_hi: 'सभी भूमिधारक किसान परिवारों को कृषि इनपुट खरीदने में मदद करने के लिए प्रति वर्ष ₹6,000 की सीधी आय सहायता।',
    tags: ['Income', 'Central', 'Annual'],
    applyUrl: 'https://pmkisan.gov.in/',
    detailsUrl: 'https://pmkisan.gov.in/',
  },
  {
    id: 2, name: 'PM Fasal Bima Yojana', name_kn: 'ಪಿಎಂ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ', name_hi: 'पीएम फसल बीमा योजना',
    state: 'All States', ministry: 'Ministry of Agriculture', ministry_kn: 'ಕೃಷಿ ಸಚಿವಾಲಯ', ministry_hi: 'कृषि मंत्रालय',
    amount: 'Financial compensation and insurance coverage up to ₹2,00,000 per hectare for notified food and oilseed crops.',
    amount_kn: 'ಅಧಿಸೂಚಿತ ಆಹಾರ ಮತ್ತು ಎಣ್ಣೆಕಾಳು ಬೆಳೆಗಳಿಗೆ ಪ್ರತಿ ಹೆಕ್ಟೇರ್‌ಗೆ ಗರಿಷ್ಠ ₹2,0,0,000 ವರೆಗೆ ಆರ್ಥಿಕ ಪರಿಹಾರ ಮತ್ತು ವಿಮಾ ರಕ್ಷಣೆ.',
    amount_hi: 'अधिसूचित खाद्य और तिलहन फसलों के लिए प्रति हेक्टेयर ₹2,00,000 तक का वित्तीय मुआवजा और बीमा कवरेज।',
    deadline: '15 Apr 2026', status: 'Open', category: 'Insurance',
    desc: 'Comprehensive crop insurance scheme providing financial support to farmers suffering crop loss due to natural calamities, pests, and diseases.',
    desc_kn: 'ನೈಸರ್ಗಿಕ ವಿಕೋಪಗಳು, ಕೀಟಗಳು ಮತ್ತು ರೋಗಗಳಿಂದ ಬೆಳೆ ನಷ್ಟವನ್ನು ಅನುಭವಿಸುವ ರೈತರಿಗೆ ಆರ್ಥಿಕ ಬೆಂಬಲವನ್ನು ನೀಡುವ ಸಮಗ್ರ ಬೆಳೆ ವಿಮಾ ಯೋಜನೆ.',
    desc_hi: 'प्राकृतिक आपदाओं, के कारण फसल के नुकसान का सामना करने वाले किसानों को वित्तीय सहायता प्रदान करने वाली व्यापक फसल बीमा योजना।',
    tags: ['Insurance', 'Crops', 'Risk'],
    applyUrl: 'https://pmfby.gov.in/',
    detailsUrl: 'https://pmfby.gov.in/',
  },
  {
    id: 3, name: 'Kisan Credit Card (KCC)', name_kn: 'ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (KCC)', name_hi: 'किसान क्रेडिट कार्ड (KCC)',
    state: 'All States', ministry: 'NABARD / Banks', ministry_kn: 'ನಬಾರ್ಡ್ / ಬ್ಯಾಂಕುಗಳು', ministry_hi: 'नाबार्ड / बैंक',
    amount: 'Short-term credit limit up to ₹3,00,000 at a highly subsidized interest rate of 4% per annum with timely repayment.',
    amount_kn: 'ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಮರುಪಾವತಿ ಮಾಡಿದರೆ ವರ್ಷಕ್ಕೆ ಕೇವಲ 4% ರಷ್ಟು ರಿಯಾಯಿತಿ ಬಡ್ಡಿ ದರದಲ್ಲಿ ₹3,0,000 ವರೆಗೆ ಅಲ್ಪಾವಧಿ ಸಾಲ.',
    amount_hi: 'समय पर पुनर्भुगतान करने पर प्रति वर्ष 4% की अत्यधिक रियायती ब्याज दर पर ₹3,0,000 तक की अल्पकालिक ऋण सीमा।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Credit',
    desc: 'Provides farmers with timely and hassle-free access to short-term credit for cultivation, crop production, and maintenance needs.',
    desc_kn: 'ರೈತರಿಗೆ ಕೃಷಿ, ಬೆಳೆ ಉತ್ಪಾದನೆ ಮತ್ತು ನಿರ್ವಹಣಾ ಅಗತ್ಯಗಳಿಗಾಗಿ ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಮತ್ತು ಜಗಳ ಮುಕ್ತ ಅಲ್ಪಾವಧಿ ಸಾಲದ ಸೌಲಭ್ಯವನ್ನು ಒದಗಿಸುತ್ತದೆ.',
    desc_hi: 'किसानों को खेती, फसल उत्पादन और रखरखाव की जरूरतों के लिए समय पर और परेशानी मुक्त अल्पकालिक ऋण प्रदान करता है।',
    tags: ['Credit', 'Loan', 'Interest Subvention'],
    applyUrl: 'https://www.nabard.org/',
    detailsUrl: 'https://www.india.gov.in/',
  },
  {
    id: 4, name: 'Raita Siri – Karnataka', name_kn: 'ರೈತ ಸಿರಿ – ಕರ್ನಾಟಕ', name_hi: 'ರೈತ ಸಿರಿ – ಕರ್ನಾಟಕ',
    state: 'Karnataka', ministry: 'Karnataka Agriculture Dept.', ministry_kn: 'ಕರ್ನಾಟಕ ಕೃಷಿ ಇಲಾಖೆ', ministry_hi: 'कर्नाटक कृषि विभाग',
    amount: 'Cash incentive of ₹10,000 per hectare directly credited to the bank accounts of registered millet farmers.',
    amount_kn: 'ನೋಂದಾಯಿತ ಸಿರಿಧಾನ್ಯ ರೈತರ ಬ್ಯಾಂಕ್ ಖಾತೆಗಳಿಗೆ ನೇರವಾಗಿ ಪ್ರತಿ ಹೆಕ್ಟೇರ್‌ಗೆ ₹10,000 ನಗದು ಪ್ರೋತ್ಸಾಹ ಧನ ಜಮೆ.',
    amount_hi: 'पंजीकृत बाजरा किसानों के बैंक खातों में सीधे ₹10,000 प्रति हेक्टेयर का नकद प्रोत्साहन हस्तांतरित।',
    deadline: '30 Jun 2026', status: 'Open', category: 'State Scheme',
    desc: 'Karnataka government scheme promoting the cultivation of minor millets by providing financial incentives directly to millet growers.',
    desc_kn: 'ಕಿರು ಧಾನ್ಯಗಳ (ಸಿರಿಧಾನ್ಯ) ಬೆಳೆಗಾರರಿಗೆ ನೇರವಾಗಿ ಆರ್ಥಿಕ ಪ್ರೋತ್ಸಾಹವನ್ನು ನೀಡುವ ಮೂಲಕ ಸಿರಿಧಾನ್ಯಗಳ ಬೇಸಾಯವನ್ನು ಉತ್ತೇಜಿಸುವ ಕರ್ನಾಟಕ ರಾಜ್ಯ ಸರ್ಕಾರದ ಯೋಜನೆ.',
    desc_hi: 'बाजरा उत्पादकों को सीधे वित्तीय प्रोत्साहन प्रदान करके छोटे बाजरा की खेती को बढ़ावा देने के लिए कर्नाटक राज्य सरकार की पहल।',
    tags: ['Karnataka', 'State', 'Compensation'],
    applyUrl: 'https://raitamitra.karnataka.gov.in/',
    detailsUrl: 'https://raitamitra.karnataka.gov.in/',
  },
  {
    id: 5, name: 'PM Kisan Maan Dhan Yojana', name_kn: 'ಪಿಎಂ ಕಿಸಾನ್ ಮಾನ್ ಧನ್ ಯೋಜನೆ', name_hi: 'पीएम किसान मान धन योजना',
    state: 'All States', ministry: 'Ministry of Agriculture', ministry_kn: 'ಕೃಷಿ ಸಚಿವಾಲಯ', ministry_hi: 'कृषि मंत्रालय',
    amount: 'Guaranteed monthly pension of ₹3,00,000 after attaining the age of 60 years, with minimal monthly contributions.',
    amount_kn: 'ಕನಿಷ್ಠ ಮಾಸಿಕ ಕೊಡುಗೆಯೊಂದಿಗೆ, 60 ವರ್ಷ ವಯಸ್ಸನ್ನು ತಲುಪಿದ ನಂತರ ಮಾಸಿಕ ₹3,000 ಖಾತರಿ ಪಿಂಚಣಿ.',
    amount_hi: '60 वर्ष की आयु प्राप्त करने के बाद न्यूनतम मासिक योगदान के साथ ₹3,000 की गारंटीकृत मासिक पेंशन।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Pension',
    desc: 'Voluntary and contributory pension scheme for small and marginal farmers to provide social security and financial stability in old age.',
    desc_kn: 'ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರಿಗೆ ವೃದ್ಧಾಪ್ಯದಲ್ಲಿ ಸಾಮಾಜಿಕ ಭದ್ರತೆ ಮತ್ತು ಆರ್ಥಿಕ ಸ್ಥಿರ性を ಒದಗಿಸಲು ಸ್ವಯಂಪ್ರೇರಿತ ಮತ್ತು ಕೊಡುಗೆ ಆಧಾರಿತ ಪಿಂಚಣಿ ಯೋಜನೆ.',
    desc_hi: 'वृद्धावस्था में सामाजिक सुरक्षा और वित्तीय स्थिरता प्रदान करने के लिए छोटे और सीमांत किसानों के लिए स्वैच्छिक और अंशदायी पेंशन योजना।',
    tags: ['Pension', 'Social Security', 'Old Age'],
    applyUrl: 'https://maandhan.in/',
    detailsUrl: 'https://maandhan.in/',
  },
  {
    id: 6, name: 'PMKSY – Per Drop More Crop', name_kn: 'ಪಿಎಂಕೆಎಸ್‌ವೈ – ಪರ್ ಡ್ರಾಪ್ ಮೋರ್ ಕ್ರಾಪ್', name_hi: 'पीएमकेएसवाई – पर ड्रॉप मोर क्रॉप',
    state: 'All States', ministry: 'Ministry of Jal Shakti', ministry_kn: 'ಜಲ ಶಕ್ತಿ ಸಚಿವಾಲಯ', ministry_hi: 'जल शक्ति मंत्रालय',
    amount: 'Subsidy of up to 90% of the total installation cost of drip and sprinkler irrigation systems for small and marginal farmers.',
    amount_kn: 'ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರಿಗೆ ಹನಿ ಮತ್ತು ತುಂತುರು ನೀರಾವರಿ ವ್ಯವಸ್ಥೆಗಳ ಒಟ್ಟು ವೆಚ್ಚದ ಮೇಲೆ ಶೇಕಡಾ 90 ರವರೆಗೆ ಸಬ್ಸಿಡಿ.',
    amount_hi: 'छोटे और सीमांत किसानों के लिए ड्रिप और स्प्रिंकलर सिंचाई प्रणालियों की कुल स्थापना लागत पर 90% तक की सब्सिडी।',
    deadline: '31 Mar 2026', status: 'Open', category: 'Irrigation',
    desc: 'Focuses on improving water use efficiency at the farm level through modern micro-irrigation technologies like drip and sprinkler systems.',
    desc_kn: 'ಹನಿ ಮತ್ತು ಸಿಂಪಡಣೆ (ಸ್ಪ್ರಿಂಕ್ಲರ್) ವ್ಯವಸ್ಥೆಗಳಂತಹ ಆಧುನಿಕ ಸೂಕ್ಷ್ಮ ನೀರಾವರಿ ತಂತ್ರಜ್ಞಾನಗಳ ಮೂಲಕ ಜಮೀನಿನಲ್ಲಿ ನೀರಿನ ಬಳಕೆಯ ದಕ್ಷತೆಯನ್ನು ಸುಧಾರಿಸುವ ಯೋಜನೆ.',
    desc_hi: 'टपकन (ड्रिप) और छिड़काव (स्प्रिंकलर) जैसी आधुनिक सूक्ष्म सिंचाई तकनीकों के माध्यम से कृषि स्तर पर जल उपयोग दक्षता में सुधार पर ध्यान केंद्रित करता है।',
    tags: ['Irrigation', 'Drip', 'Subsidy'],
    applyUrl: 'https://pmksy.gov.in/',
    detailsUrl: 'https://pmksy.gov.in/',
  },
  {
    id: 7, name: 'Paramparagat Krishi Vikas Yojana (PKVY)', name_kn: 'ಪರಂಪರಾಗತ್ ಕೃಷಿ ವಿಕಾಸ್ ಯೋಜನೆ (PKVY)', name_hi: 'परंपरागत कृषि विकास योजना (PKVY)',
    state: 'All States', ministry: 'Ministry of Agriculture', ministry_kn: 'ಕೃಷಿ ಸಚಿವಾಲಯ', ministry_hi: 'कृषि मंत्रालय',
    amount: 'Financial assistance of ₹50,000 per hectare over 3 years, covering organic seed purchase, harvesting, and marketing.',
    amount_kn: 'ಸಾವಯವ ಬೀಜ ಖರೀದಿ, ಕೊಯ್ಲು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ವೆಚ್ಚಗಳಿಗಾಗಿ 3 ವರ್ಷಗಳಲ್ಲಿ ಪ್ರತಿ ಹೆಕ್ಟೇರ್‌ಗೆ ₹50,000 ಆರ್ಥಿಕ ಸಹಾಯ.',
    amount_hi: 'जैविक बीज खरीद, कटाई और विपणन को कवर करने के लिए 3 वर्षों में ₹50,000 प्रति हेक्टेयर की वित्तीय सहायता।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Organic Farming',
    desc: 'Promotes commercial organic farming through cluster models, participatory guarantee system certification, and organic input subsidies.',
    desc_kn: 'ಕ್ಲಸ್ಟರ್ ಮಾದರಿಗಳು, ಸಾವಯವ ಪ್ರಮಾಣೀಕರಣ ಮತ್ತು ಸಾವಯವ ಪರಿಕರಗಳ ಸಬ್ಸಿಡಿಗಳ ಮೂಲಕ ವಾಣಿಜ್ಯ ಸಾವಯವ ಕೃಷಿಯನ್ನು ಉತ್ತೇಜಿಸುವ ಯೋಜನೆ.',
    desc_hi: 'क्लस्टर मॉडल, सहभागी गारंटी प्रणाली प्रमाणन और जैविक इनपुट सब्सिडी के माध्यम से व्यावसायिक जैविक खेती को बढ़ावा देता है।',
    tags: ['Organic', 'Subsidy', 'Sustainable'],
    applyUrl: 'https://dap.dac.gov.in/',
    detailsUrl: 'https://pgsindia-ncof.gov.in/',
  },
  {
    id: 8, name: 'Sub-Mission on Agricultural Mechanization (SMAM)', name_kn: 'ಸಬ್-ಮಿಷನ್ ಆನ್ ಅಗ್ರಿಕಲ್ಚರಲ್ ಮೆಕನೈಸೇಶನ್ (SMAM)', name_hi: 'सब-मिशन ऑन एग्रीकल्चरल मैकेनाइजेशन (SMAM)',
    state: 'All States', ministry: 'Ministry of Agriculture', ministry_kn: 'ಕೃಷಿ ಸಚಿವಾಲಯ', ministry_hi: 'कृषि मंत्रालय',
    amount: 'Financial subsidy of 40% to 50% on the purchase price of agricultural machinery, with up to 80% for custom hiring centers.',
    amount_kn: 'ಕೃಷಿ ಯಂತ್ರೋಪಕರಣಗಳ ಖರೀದಿ ಬೆಲೆಯ ಮೇಲೆ ಶೇಕಡಾ 40 ರಿಂದ 50 ರಷ್ಟು ಸಬ್ಸಿಡಿ, and ಕಸ್ಟಮ್ ಹೈರಿಂಗ್ ಕೇಂದ್ರಗಳಿಗೆ ಶೇಕಡಾ 80 ರವರೆಗೆ ಸಬ್ಸಿಡಿ.',
    amount_hi: 'कृषि मशीनरी की खरीद कीमत पर 40% से 50% की वित्तीय सब्सिडी, कस्टम हायरिंग केंद्रों के लिए 80% तक की सब्सिडी।',
    deadline: '31 Dec 2026', status: 'Open', category: 'Machinery',
    desc: 'Promotes farm mechanization by providing subsidies for purchasing tractors, power tillers, rotavators, and high-tech custom hiring equipment.',
    desc_kn: 'ಟ್ರಾಕ್ಟರ್‌ಗಳು, ಪವರ್ ಟಿಲ್ಲರ್‌ಗಳು, ರೋಟಾವೇಟರ್‌ಗಳು ಮತ್ತು ಸುಧಾರಿತ ಯಂತ್ರೋಪಕರಣಗಳ ಖರೀದಿಗೆ ಸಬ್ಸಿಡಿ ನೀಡುವ ಮೂಲಕ ಕೃಷಿ ಯಾಂತ್ರೀಕರಣವನ್ನು ಉತ್ತೇಜಿಸುತ್ತದೆ.',
    desc_hi: 'ट्रैक्टर, पावर टिलर, रोटावेटर और हाई-टेक कस्टम हायरिंग उपकरणों की खरीद के लिए सब्सिडी प्रदान करके कृषि मशीनीकरण को बढ़ावा देता है।',
    tags: ['Machinery', 'Tractors', 'Subsidy'],
    applyUrl: 'https://agrimachinery.nic.in/',
    detailsUrl: 'https://farmech.dac.gov.in/',
  },
  {
    id: 9, name: 'PM Matsya Sampada Yojana (PMMSY)', name_kn: 'ಪಿಎಂ ಮತ್ಸ್ಯ ಸಂಪದ ಯೋಜನೆ (PMMSY)', name_hi: 'पीएम मत्स्य संपदा योजना (PMMSY)',
    state: 'All States', ministry: 'Department of Fisheries', ministry_kn: 'ಮೀನುಗಾರಿಕೆ ಇಲಾಖೆ', ministry_hi: 'मत्स्य पालन विभाग',
    amount: 'Financial subsidy of 40% for general category and 60% for SC/ST/women for setting up aquaculture ponds and cold storage.',
    amount_kn: 'ಮೀನು ಸಾಕಣೆ ಕೊಳಗಳು ಮತ್ತು ಶೀತಲ ಸಂಗ್ರಹಣಾ ಘಟಕಗಳನ್ನು ಸ್ಥಾಪಿಸಲು ಸಾಮಾನ್ಯ ವರ್ಗಕ್ಕೆ 40% ಮತ್ತು ಎಸ್‌ಸಿ/ಎಸ್‌ಟಿ/ಮಹಿಳೆಯರಿಗೆ 60% ಆರ್ಥಿಕ ಸಬ್ಸಿಡಿ.',
    amount_hi: 'एक्वाकल्चर तालाबों और कोल्ड स्टोरेज की स्थापना के लिए सामान्य श्रेणी के लिए 40% और एससी/एसटी/महिलाओं के लिए 60% वित्तीय सब्सिडी।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Aquaculture',
    desc: 'Aims to ecologically and economically develop the fisheries sector through modernization, fisheries infrastructure creation, and value chain support.',
    desc_kn: 'ಆಧುನೀಕರಣ, ಮೀನುಗಾರಿಕೆ ಮೂಲಸೌಕರ್ಯಗಳ ರಚನೆ ಮತ್ತು ಮೌಲ್ಯ ಸರಪಳಿ ಬೆಂಬಲದ ಮೂಲಕ ಮೀನುಗಾರಿಕೆ ವಲಯವನ್ನು ಪರಿಸರ ಮತ್ತು ಆರ್ಥಿಕವಾಗಿ ಅಭಿವೃದ್ಧಿಪಡಿಸುವ ಗುರಿಯನ್ನು ಹೊಂದಿದೆ.',
    desc_hi: 'आधुनिकीकरण, मत्स्य पालन बुनियादी ढांचे के निर्माण और मूल्य श्रृंखला सहायता के माध्यम से मत्स्य पालन क्षेत्र को पारिस्थितिक और आर्थिक रूप से विकसित करना है।',
    tags: ['Aquaculture', 'Fisheries', 'Infrastructure'],
    applyUrl: 'https://pmmsy.dof.gov.in/',
    detailsUrl: 'https://dof.gov.in/pmmsy',
  },
  {
    id: 10, name: 'Krishi Karunya Scheme (Karnataka)', name_kn: 'ಕೃಷಿ ಕಾರುಣ್ಯ ಯೋಜನೆ (ಕರ್ನಾಟಕ)', name_hi: 'कृषि कारुण्या योजना (कर्नाटक)',
    state: 'Karnataka', ministry: 'Karnataka Agriculture Dept.', ministry_kn: 'ಕರ್ನಾಟಕ ಕೃಷಿ ಇಲಾಖೆ', ministry_hi: 'कर्नाटक कृषि विभाग',
    amount: 'Ex-gratia financial assistance of ₹5,00,000 to the family of the farmer in case of accidental death during agricultural work.',
    amount_kn: 'ಕೃಷಿ ಕೆಲಸದ ಸಮಯದಲ್ಲಿ ಆಕಸ್ಮಿಕ ಮರಣ ಹೊಂದಿದಲ್ಲಿ ರೈತರ ಕುಟುಂಬಕ್ಕೆ ₹5,00,000 ವರೆಗೆ ಪರಿಹಾರ ಧನ.',
    amount_hi: 'कृषि कार्य के दौरान आकस्मिक मृत्यु के मामले में किसान के परिवार को ₹5,00,000 की अनुग्रह वित्तीय सहायता।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'State Scheme',
    desc: 'Provides accidental death and permanent disability insurance coverage to registered farmers in the state of Karnataka.',
    desc_kn: 'ಕರ್ನಾಟಕ ರಾಜ್ಯದ ನೋಂದಾಯಿತ ರೈತರಿಗೆ ಆಕಸ್ಮಿಕ ಮರಣ ಮತ್ತು ಶಾಶ್ವತ ಅಂಗವಿಕಲತೆಗೆ ವಿಮಾ ರಕ್ಷಣೆ ಒದಗಿಸುವ ರಾಜ್ಯ ಸರ್ಕಾರದ ಯೋಜನೆ.',
    desc_hi: 'कर्नाटक राज्य में पंजीकृत किसानों को आकस्मिक मृत्यु और स्थायी विकलांगता बीमा कवर्ड प्रदान करता है।',
    tags: ['Karnataka', 'Insurance', 'Accident Cover'],
    applyUrl: 'https://raitamitra.karnataka.gov.in/',
    detailsUrl: 'https://raitamitra.karnataka.gov.in/',
  },
  {
    id: 11, name: 'Har Khet Ko Pani (PMKSY-HKKP)', name_kn: 'ಹರ್ ಖೇತ್ ಕೋ ಪಾನಿ (PMKSY-HKKP)', name_hi: 'हर खेत को पानी (PMKSY-HKKP)',
    state: 'All States', ministry: 'Ministry of Jal Shakti', ministry_kn: 'ಜಲ ಶಕ್ತಿ ಸಚಿವಾಲಯ', ministry_hi: 'जल शक्ति मंत्रालय',
    amount: 'Subsidizes up to 70% of the cost for community water harvesting structures, borewell rejuvenation, and field channels.',
    amount_kn: 'ಸಾಮುದಾಯಿಕ ನೀರು ಕೊಯ್ಲು ರಚನೆಗಳು, ಕೊಳವೆಬಾವಿ ಪುನಶ್ಚೇತನ ಮತ್ತು ಕಾಲುವೆಗಳ ನಿರ್ಮಾಣದ ವೆಚ್ಚದ ಮೇಲೆ ಶೇಕಡಾ 70 ರವರೆಗೆ ಸಬ್ಸಿಡಿ.',
    amount_hi: 'सामुदायिक जल संचयन संरचनाओं, नलकूप पुनरुद्धार और मैदानी नहरों के लिए लागत का 70% तक सब्सिडी प्रदान करता है।',
    deadline: '31 Mar 2027', status: 'Open', category: 'Irrigation',
    desc: 'Focuses on creating new water sources, expanding cultivable command areas, and distributing water-saving surface irrigation systems.',
    desc_kn: 'ಹೊಸ ನೀರಿನ ಮೂಲಗಳನ್ನು ಸೃಜಿಸುವುದು, ಸಾಗುವಳಿ ಯೋಗ್ಯ ಜಮೀನಿನ ವಿಸ್ತರಣೆ ಮತ್ತು ಉಳಿತಾಯದ ಮೇಲ್ಮೈ ನೀರಾವರಿ ವ್ಯವಸ್ಥೆಗಳ ವಿತರಣೆಯ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸುತ್ತದೆ.',
    desc_hi: 'नए जल स्रोतों के निर्माण, कृषि योग्य कमान क्षेत्रों के विस्तार और पानी बचाने वाली सतही सिंचाई प्रणालियों के वितरण पर ध्यान केंद्रित करता है।',
    tags: ['Irrigation', 'Water', 'Subsidy'],
    applyUrl: 'https://pmksy.gov.in/',
    detailsUrl: 'https://pmksy.gov.in/',
  },
  {
    id: 12, name: 'National Horticulture Mission (NHM)', name_kn: 'ನ್ಯಾಷನಲ್ ಹಾರ್ಟಿಕಲ್ಚರ್ ಮಿಷನ್ (NHM)', name_hi: 'नेशनल हॉर्टिकल्चर मिशन (NHM)',
    state: 'All States', ministry: 'Ministry of Agriculture', ministry_kn: 'ಕೃಷಿ ಸಚಿವಾಲಯ', ministry_hi: 'कृषि मंत्रालय',
    amount: 'Up to 50% financial subsidy for establishing new orchards, nursery setups, protected cultivation (polyhouses), and cold storage.',
    amount_kn: 'ಹೊಸ ತೋಟಗಳು, ನರ್ಸರಿಗಳು, ಸಂರಕ್ಷಿತ ಬೇಸಾಯ (ಪಾಲಿಹೌಸ್) ಮತ್ತು ಶೀತಲ ಸಂಗ್ರಹಣಾ ಘಟಕಗಳ ಸ್ಥಾಪನೆಗೆ ಶೇಕಡಾ 50 ರವರೆಗೆ ಆರ್ಥಿಕ ಸಬ್ಸಿಡಿ.',
    amount_hi: 'नए बागों की स्थापना, नर्सरी सेटअप, संरक्षित खेती (पॉलीहाउस) और कोल्ड स्टोरेज के लिए 50% तक वित्तीय सब्सिडी।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Horticulture',
    desc: 'Promotes holistic growth of the horticulture sector, including fruits, vegetables, root and tuber crops, mushrooms, spices, and flowers.',
    desc_kn: 'ಹಣ್ಣುಗಳು, ತರಕಾರಿಗಳು, ಗೆಡ್ಡೆ ಗೆಣಸು ಬೆಳೆಗಳು, ಅಣಬೆಗಳು, ಸಾಂಬಾರ ಪದಾರ್ಥಗಳು ಮತ್ತು ಹೂವುಗಳು ಸೇರಿದಂತೆ ತೋಟಗಾರಿಕಾ ವಲಯದ ಸಮಗ್ರ ಬೆಳವಣಿಗೆಯನ್ನು ಉತ್ತೇಜಿಸುತ್ತದೆ.',
    desc_hi: 'बागवानी क्षेत्र के समग्र विकास को बढ़ावा देता है, जिसमें फल, सब्जियां, कंद फसलें, मशरूम, मसाले और फूल शामिल हैं।',
    tags: ['Horticulture', 'Greenhouse', 'Orchards'],
    applyUrl: 'https://dap.dac.gov.in/',
    detailsUrl: 'https://midh.gov.in/nhm.html',
  },
  {
    id: 13, name: 'Agri-Clinics & Agri-Business Centres (ACABC)', name_kn: 'ಅಗ್ರಿ-ಕ್ಲಿನಿಕ್ಸ್ ಮತ್ತು ಅಗ್ರಿ-ಬಿಸಿನೆಸ್ ಸೆಂಟರ್ಸ್ (ACABC)', name_hi: 'एग्री-क्लिनिक्स एंड एग्री-बिजनेस सेंटर्स (ACABC)',
    state: 'All States', ministry: 'Ministry of Agriculture / NABARD', ministry_kn: 'ಕೃಷಿ ಸಚಿವಾಲಯ / ನಬಾರ್ಡ್', ministry_hi: 'कृषि मंत्रालय / नाबार्ड',
    amount: 'Provides credit-linked capital subsidy of 36% (general) to 44% (SC/ST/women) on bank loans up to ₹20,00,000.',
    amount_kn: '₹20,00,000 ವರೆಗಿನ ಬ್ಯಾಂಕ್ ಸಾಲಗಳ ಮೇಲೆ ಶೇಕಡಾ 36 (ಸಾಮಾನ್ಯ) ರಿಂದ ಶೇಕಡಾ 44 (ಎಸ್‌ಸಿ/ಎಸ್‌ಟಿ/ಮಹಿಳಾ) ರವರೆಗೆ ಬಂಡವಾಳ ಸಬ್ಸಿಡಿ.',
    amount_hi: '₹20,00,000 तक के बैंक ऋण पर 36% (सामान्य) से 44% (एससी/एसटी/महिला) की क्रेडिट-लिंक्ड पूंजी सब्सिडी प्रदान करता है।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Credit',
    desc: 'Supports agricultural graduates and entrepreneurs to set up custom service centers and agri-ventures to advise farmers.',
    desc_kn: 'ಕೃಷಿ ಪದವೀಧರರು ಮತ್ತು ಉದ್ಯಮಿಗಳು ರೈತರಿಗೆ ಸಲಹೆ ನೀಡಲು ಕಸ್ಟಮ್ ಸೇವಾ ಕೇಂದ್ರಗಳು ಮತ್ತು ಕೃಷಿ ಉದ್ಯಮಗಳನ್ನು ಸ್ಥಾಪಿಸಲು ಬೆಂಬಲ ನೀಡುತ್ತದೆ.',
    desc_hi: 'कृषि स्नातकों और उद्यमियों को किसानों को सलाह देने के लिए कस्टम सेवा केंद्र और कृषि-उद्यम स्थापित करने में सहायता करता है।',
    tags: ['Startup', 'Credit', 'Business'],
    applyUrl: 'https://www.nabard.org/',
    detailsUrl: 'https://www.agriclinics.net/',
  },
  {
    id: 14, name: 'Weather-Based Crop Insurance Scheme (WBCIS)', name_kn: 'ವೆದರ್-ಬೇಸ್ಡ್ ಕ್ರಾಪ್ ಇನ್ಶೂರೆನ್ಸ್ ಸ್ಕೀಮ್ (WBCIS)', name_hi: 'वेदर-बेस्ड क्रॉप इंश्योरेंस स्कीम (WBCIS)',
    state: 'All States', ministry: 'Ministry of Agriculture', ministry_kn: 'ಕೃಷಿ ಸಚಿವಾಲಯ', ministry_hi: 'कृषि मंत्रालय',
    amount: 'Compensates farmers for yield losses calculated using weather deviation data from local automated weather stations.',
    amount_kn: 'ಸ್ಥಳೀಯ ಸ್ವಯಂಚಾಲಿತ ಹವಾಮಾನ ಕೇಂದ್ರಗಳ ಹವಾಮಾನ ವಿಚಲನ ದತ್ತಾಂಶವನ್ನು ಬಳಸಿಕೊಂಡು ಲೆಕ್ಕಹಾಕಿದ ಇಳುವರಿ ನಷ್ಟಕ್ಕೆ ರೈತರಿಗೆ ಪರಿಹಾರ ನೀಡುತ್ತದೆ.',
    amount_hi: 'स्थानीय स्वचालित मौसम स्टेशनों से मौसम विचलन डेटा का उपयोग करके गणना की गई उपज हानि के लिए किसानों को मुआवजा देता है।',
    deadline: '31 Dec 2026', status: 'Open', category: 'Insurance',
    desc: 'Provides insurance payouts to farmers based on adverse weather indices like excess rainfall, heatwaves, or high humidity triggering diseases.',
    desc_kn: 'ಅತಿಯಾದ ಮಳೆ, ಬಿಸಿಲಿನ ಬೇಗೆ ಅಥವಾ ರೋಗಗಳಿಗೆ ಕಾರಣವಾಗುವ ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆಯಂತಹ ಪ್ರತಿಕೂಲ ಹವಾಮಾನ ಸೂಚ್ಯಂಕಗಳ ಆಧಾರದ ಮೇಲೆ ರೈತರಿಗೆ ವಿಮಾ ಪರಿಹಾರ ಒದಗಿಸುತ್ತದೆ.',
    desc_hi: 'अत्यधिक वर्षा, लू या बीमारियों को ट्रिगर करने वाली उच्च आर्द्रता जैसे प्रतिकूल मौसम सूचकांकों के आधार पर किसानों को बीमा भुगतान प्रदान करता है।',
    tags: ['Insurance', 'Weather', 'Crops'],
    applyUrl: 'https://pmfby.gov.in/',
    detailsUrl: 'https://pmfby.gov.in/',
  },
  {
    id: 15, name: 'Integrated Pest Management (IPM) Promotion Scheme', name_kn: 'ಇಂಟಿಗ್ರೇಟೆಡ್ ಪೆಸ್ಟ್ ಮ್ಯಾನೇಜ್ಮೆಂಟ್ (IPM) ಪ್ರಮೋಷನ್ ಸ್ಕೀಮ್', name_hi: 'इटीग्रेटेड पेस्ट मैनेजमेंट (IPM) प्रमोशन स्कीम',
    state: 'All States', ministry: 'Ministry of Agriculture', ministry_kn: 'ಕೃಷಿ ಸಚಿವಾಲಯ', ministry_hi: 'कृषि मंत्रालय',
    amount: 'Provides 50% financial subsidy on biological inputs, neem-based sprays, pheromone traps, and biological control agents.',
    amount_kn: 'ಜೈವಿಕ ಪರಿಕರಗಳು, ಬೇವಿನ ಆಧಾರಿತ ಸಿಂಪಡಣೆಗಳು, ಫೆರೋಮೋನ್ ಬಲೆಗಳು ಮತ್ತು ಜೈವಿಕ ನಿಯಂತ್ರಣ ಏಜೆಂಟ್‌ಗಳ ಮೇಲೆ ಶೇಕಡಾ 50 ರಷ್ಟು ಆರ್ಥಿಕ ಸಬ್ಸಿಡಿ.',
    amount_hi: 'जैविक इनपुट, नीम आधारित स्प्रे, फेरोमोन ट्रैप और जैविक नियंत्रण एजेंटों पर 50% वित्तीय सब्सिडी प्रदान करता है।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Crop Protection',
    desc: 'Promotes eco-friendly pest and disease control through biological agents, pheromone traps, and bio-pesticides to minimize chemical use.',
    desc_kn: 'ರಾಸಾಯನಿಕಗಳ ಬಳಕೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಜೈವಿಕ ಏಜೆಂಟ್‌ಗಳು, ಫೆರೋಮೋನ್ ಬಲೆಗಳು ಮತ್ತು ಜೈವಿಕ ಕೀಟನಾಶಕಗಳ ಮೂಲಕ ಪರಿಸರಸ್ನೇಹಿ ಕೀಟ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣವನ್ನು ಉತ್ತೇಜಿಸುತ್ತದೆ.',
    desc_hi: 'रासायनिक उपयोग को कम करने के लिए जैविक एजेंटों, फेरोमोन ट्रैप और जैव-कीटनाशकों के माध्यम से पर्यावरण के अनुकूल कीट और रोग नियंत्रण को बढ़ावा देता है।',
    tags: ['Pest Control', 'Subsidy', 'Organic'],
    applyUrl: 'https://dacfw.nic.in/',
    detailsUrl: 'https://dacfw.nic.in/',
  },
  {
    id: 16, name: 'National Horticulture Board (NHB) Subsidy', name_kn: 'ನ್ಯಾಷನಲ್ ಹಾರ್ಟಿಕಲ್ಚರ್ ಬೋರ್ಡ್ (NHB) ಸಬ್ಸಿಡಿ', name_hi: 'नेशनल हॉर्टिकल्चर बोर्ड (NHB) सब्सिडी',
    state: 'All States', ministry: 'National Horticulture Board', ministry_kn: 'ರಾಷ್ಟ್ರೀಯ ತೋಟಗಾರಿಕಾ ಮಂಡಳಿ', ministry_hi: 'राष्ट्रीय बागवानी बोर्ड',
    amount: 'Provides capital investment subsidy of 40% to 50% for commercial horticulture projects up to ₹30,00,000.',
    amount_kn: '₹30,00,000 ವರೆಗಿನ ವಾಣಿಜ್ಯ ತೋಟಗಾರಿಕಾ ಯೋಜನೆಗಳಿಗೆ ಶೇಕಡಾ 40 ರಿಂದ 50 ರವರೆಗೆ ಬಂಡವಾಳ ಹೂಡಿಕೆ ಸಬ್ಸಿಡಿ.',
    amount_hi: '₹30,00,000 तक की व्यावसायिक बागवानी परियोजनाओं के लिए 40% से 50% की पूंजी निवेश सब्सिडी प्रदान करता है।',
    deadline: '31 Dec 2026', status: 'Open', category: 'Horticulture',
    desc: 'Aims to develop commercial horticulture, improve post-harvest management, and establish cold chain infrastructures across India.',
    desc_kn: 'ವಾಣಿಜ್ಯ ತೋಟಗಾರಿಕೆಯನ್ನು ಅಭಿವೃದ್ಧಿಪಡಿಸುವುದು, ಕೊಯ್ಲೋತ್ತರ ನಿರ್ವಹಣೆಯನ್ನು ಸುಧಾರಿಸುವುದು ಮತ್ತು ಭಾರತದಾದ್ಯಂತ ಶೀತಲ ಸರಪಳಿ ಮೂಲಸೌಕರ್ಯಗಳನ್ನು ಸ್ಥಾಪಿಸುವ ಗುರಿಯನ್ನು ಹೊಂದಿದೆ.',
    desc_hi: 'व्यावसायिक बागवानी विकसित करना, कटाई के बाद के प्रबंधन में सुधार करना और पूरे भारत में कोल्ड चेन बुनियादी ढांचे की स्थापना करना है।',
    tags: ['Horticulture', 'Orchards', 'Subsidy'],
    applyUrl: 'https://nhb.gov.in/',
    detailsUrl: 'https://nhb.gov.in/',
  },
  {
    id: 17, name: 'Bayer CropScience Food Chain Partnership', name_kn: 'ಬಾಯರ್ ಕ್ರಾಪ್ ಸೈನ್ಸ್ ಫುಡ್ ಚೈನ್ ಪಾರ್ಟ್‌ನರ್‌ಶಿಪ್', name_hi: 'बायर क्रॉपसाइंस फूड चेन साझेदारी',
    state: 'All States', ministry: 'Bayer CropScience (Private/NGO)', ministry_kn: 'ಬಾಯರ್ ಕ್ರಾಪ್ ಸೈನ್ಸ್ (ಖಾಸಗಿ/NGO)', ministry_hi: 'बायर क्रॉपसाइंस (निजी/NGO)',
    amount: 'Provides free access to digital disease monitoring tools, expert field agronomy advice, and certified pest-resistant seeds.',
    amount_kn: 'ಡಿಜಿಟಲ್ ರೋಗ ಮೇಲ್ವಿಚಾರಣೆ ಪರಿಕರಗಳು, ತಜ್ಞರ ಕ್ಷೇತ್ರ ಕೃಷಿ ಸಲಹೆ ಮತ್ತು ಪ್ರಮಾಣೀಕೃತ ಕೀಟ-ನಿರೋಧಕ ಬೀಜಗಳಿಗೆ ಉಚಿತ ಪ್ರವೇಶ.',
    amount_hi: 'डिजिटल रोग निगरानी उपकरण, विशेषज्ञ कृषि सलाह और प्रमाणित कीट-प्रतिरोधी बीजों तक मुफ्त पहुंच प्रदान करता है।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Private Initiative',
    desc: 'A private initiative to train smallholder farmers in modern agronomy, disease forecasting, and global food safety compliance.',
    desc_kn: 'ಸಣ್ಣ ರೈತರಿಗೆ ಆಧುನಿಕ ಕೃಷಿ ವಿಜ್ಞಾನ, ರೋಗ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಜಾಗತಿಕ ಆಹಾರ ಸುರಕ್ಷತಾ ಅನುಸರಣೆಯಲ್ಲಿ ತರಬೇತಿ ನೀಡುವ ಖಾಸಗಿ ಉಪಕ್ರಮ.',
    desc_hi: 'छोटे किसानों को आधुनिक कृषि विज्ञान, रोग पूर्वानुमान और वैश्विक खाद्य सुरक्षा अनुपालन में प्रशिक्षित करने की एक निजी पहल।',
    tags: ['Training', 'Private', 'Disease Control'],
    applyUrl: 'https://www.bayer.in/',
    detailsUrl: 'https://www.bayer.in/',
  },
  {
    id: 18, name: 'Soil Health Card Scheme', name_kn: 'ಸಾಯಿಲ್ ಹೆಲ್ತ್ ಕಾರ್ಡ್ ಸ್ಕೀಮ್', name_hi: 'सॉइल हेल्थ कार्ड स्कीम',
    state: 'All States', ministry: 'Ministry of Agriculture', ministry_kn: 'ಕೃಷಿ ಸಚಿವಾಲಯ', ministry_hi: 'कृषि मंत्रालय',
    amount: 'Provides free soil testing once every 2 years and a printed health card detailing corrective nutrient measures.',
    amount_kn: 'ಪ್ರತಿ 2 ವರ್ಷಗಳಿಗೊಮ್ಮೆ ಉಚಿತ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ಸರಿಪಡಿಸುವ ಪೋಷಕಾಂಶ ಕ್ರಮಗಳನ್ನು ವಿವರಿಸುವ ಮುದ್ರಿತ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಅನ್ನು ಒದಗಿಸುತ್ತದೆ.',
    amount_hi: 'हर 2 साल में एक बार मुफ्त मिट्टी परीक्षण और सुधारात्मक पोषक तत्वों के उपायों का विवरण देने वाला एक मुद्रित स्वास्थ्य कार्ड प्रदान करता है।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Soil Health',
    desc: 'Assesses soil nutrient status and provides farmers with customized fertilizer and soil conditioner dosage recommendations.',
    desc_kn: 'ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳ ಸ್ಥಿತಿಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡುತ್ತದೆ ಮತ್ತು ರೈತರಿಗೆ ಕಸ್ಟಮೈಸ್ ಮಾಡಿದ ರಸಗೊಬ್ಬರ ಮತ್ತು ಮಣ್ಣಿನ ಕಂಡಿಷನರ್ ಡೋಸೇಜ್ ಶಿಫಾರಸುಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ.',
    desc_hi: 'मिट्टी के पोषक तत्वों की स्थिति का आकलन करता है और किसानों को अनुकूलित उर्वरक और मिट्टी कंडीशनर खुराक की सिफारिशें प्रदान करता है।',
    tags: ['Soil', 'Fertilizer', 'Testing'],
    applyUrl: 'https://soilhealth.dac.gov.in/',
    detailsUrl: 'https://soilhealth.dac.gov.in/',
  },
  {
    id: 19, name: 'NABARD Plantation and Horticulture Loan', name_kn: 'ನಬಾರ್ಡ್ ಪ್ಲಾಂಟೇಶನ್ ಮತ್ತು ಹಾರ್ಟಿಕಲ್ಚರ್ ಲೋನ್', name_hi: 'नाबार्ड प्लांटेशन एंड हॉर्टिकल्चर लोन',
    state: 'All States', ministry: 'NABARD', ministry_kn: 'ನಬಾರ್ಡ್', ministry_hi: 'नाबार्ड',
    amount: 'Long-term credit covering up to 90% of the project cost with a flexible repayment period of 5 to 15 years.',
    amount_kn: 'ಯೋಜನಾ ವೆಚ್ಚದ ಶೇಕಡಾ 90 ರಷ್ಟನ್ನು ಒಳಗೊಳ್ಳುವ ದೀರ್ಘಾವಧಿ ಸಾಲ ಮತ್ತು 5 ರಿಂದ 15 ವರ್ಷಗಳ ಹೊಂದಿಕೊಳ್ಳುವ ಸಾಲ ಮರುಪಾವತಿ ಅವಧಿ.',
    amount_hi: 'परियोजना लागत के 90% तक को कवर करने वाला दीर्घकालिक ऋण, जिसमें 5 से 15 वर्ष की लचीली पुनर्भुगतान अवधि होती है।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Credit',
    desc: 'Refinances commercial banks to offer long-term loans for establishing orchards, replacing old plantations, or recovering from crop disease epidemics.',
    desc_kn: 'ವಾಣಿಜ್ಯ ಬ್ಯಾಂಕುಗಳಿಗೆ ಮರುಕಡಿತ ಸೌಲಭ್ಯ ನೀಡುವ ಮೂಲಕ ರೈತರು ತೋಟಗಳನ್ನು ಸ್ಥಾಪಿಸಲು, ಹಳೆಯ ತೋಟಗಳನ್ನು ಬದಲಿಸಲು ಅಥವಾ ಸಾಂಕ್ರಾಮಿಕ ರೋಗಗಳಿಂದ ಚೇತರಿಸಿಕೊಳ್ಳಲು ದೀರ್ಘಾವಧಿ ಸಾಲ ನೀಡುತ್ತದೆ.',
    desc_hi: 'व्यावसायिक बैंकों को पुनर्वित्त प्रदान करता है ताकि वे बागों की स्थापना, पुराने बागों को बदलने या फसल रोग महामारी से उबरने के लिए दीर्घकालिक ऋण प्रदान कर सकें।',
    tags: ['Credit', 'Orchards', 'Refinance'],
    applyUrl: 'https://www.nabard.org/',
    detailsUrl: 'https://www.nabard.org/',
  },
  // ── MAHARASHTRA ──
  {
    id: 20, name: 'MahaDBT Farmer Scheme', name_kn: 'ಮಹಾಡಿಬಿಟಿ ರೈತ ಯೋಜನೆ', name_hi: 'महाडीबीटी किसान योजना',
    state: 'Maharashtra', ministry: 'Maharashtra Agriculture Dept.', ministry_kn: 'ಮಹಾರಾಷ್ಟ್ರ ಕೃಷಿ ಇಲಾಖೆ', ministry_hi: 'महाराष्ट्र कृषि विभाग',
    amount: 'Subsidizes 50% to 60% of the cost for purchasing farm machinery, tractors, and installing micro-irrigation systems.',
    amount_kn: 'ಕೃಷಿ ಯಂತ್ರೋಪಕರಣಗಳು, ಟ್ರಾಕ್ಟರ್‌ಗಳು ಮತ್ತು ಸೂಕ್ಷ್ಮ ನೀರಾವರಿ ವ್ಯವಸ್ಥೆಗಳ ಸ್ಥಾಪನೆಗೆ ಶೇಕಡಾ 50 ರಿಂದ 60 ರಷ್ಟು ಸಬ್ಸಿಡಿ.',
    amount_hi: 'कृषि मशीनरी, ट्रैक्टर खरीदने और सूक्ष्म सिंचाई प्रणाली स्थापित करने के लिए 50% से 60% की सब्सिडी।',
    deadline: '31 Dec 2026', status: 'Open', category: 'State Scheme',
    desc: 'Direct Benefit Transfer scheme by the Maharashtra government providing subsidies for farm mechanization, irrigation, and seeds.',
    desc_kn: 'ಕೃಷಿ ಯಾಂತ್ರೀಕರಣ, ನೀರಾವರಿ ಮತ್ತು ಬಿತ್ತನೆ ಬೀಜಗಳಿಗೆ ಸಬ್ಸಿಡಿ ನೀಡುವ ಮಹಾರಾಷ್ಟ್ರ ಸರ್ಕಾರದ ನೇರ ಸೌಲಭ್ಯ ವರ್ಗಾವಣೆ ಯೋಜನೆ.',
    desc_hi: 'कृषि मशीनीकरण, सिंचाई और बीजों के लिए सब्सिडी प्रदान करने वाली महाराष्ट्र सरकार की प्रत्यक्ष लाभ हस्तांतरण योजना।',
    tags: ['Maharashtra', 'Subsidy', 'Machinery'],
    applyUrl: 'https://mahadbt.maharashtra.gov.in/',
    detailsUrl: 'https://mahadbt.maharashtra.gov.in/',
  },
  {
    id: 21, name: 'Naandi Foundation Horticulture Support', name_kn: 'ನಾಂದಿ ಫೌಂಡೇಶನ್ ತೋಟಗಾರಿಕೆ ಬೆಂಬಲ', name_hi: 'नांदी फाउंडेशन बागवानी सहायता',
    state: 'Maharashtra', ministry: 'Naandi Foundation (NGO)', ministry_kn: 'ನಾಂದಿ ಫೌಂಡೇಶನ್ (NGO)', ministry_hi: 'नांदी फाउंडेशन (NGO)',
    amount: 'Free biological pest control kits, organic compost, and hands-on training on sustainable canopy management.',
    amount_kn: 'ಉಚಿತ ಜೈವಿಕ ಕೀಟ ನಿಯಂತ್ರಣ ಕಿಟ್‌ಗಳು, ಸಾವಯವ ಗೊಬ್ಬರ ಮತ್ತು ಸುಸ್ಥಿರ ಮೇಲಾವರಣ ನಿರ್ವಹಣೆಯ ಪ್ರಾಯೋಗಿಕ ತರಬೇತಿ.',
    amount_hi: 'निशुल्क जैविक किसे नियंत्रण किट, जैविक खाद, और टिकाऊ कैनोपी प्रबंधन पर व्यावहारिक प्रशिक्षण।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Private Initiative',
    desc: 'An NGO initiative supporting grape and pomegranate growers with training in zero-chemical organic disease management.',
    desc_kn: 'ದ್ರಾಕ್ಷಿ ಮತ್ತು ದಾಳಿಂಬೆ ಬೆಳೆಗಾರರಿಗೆ ರಾಸಾಯನಿಕ ರಹಿತ ಸಾವಯವ ರೋಗ ನಿರ್ವಹಣೆಯಲ್ಲಿ ತರಬೇತಿ ನೀಡುವ ಒಂದು NGO ಉಪಕ್ರಮ.',
    desc_hi: 'अंगूर और अनार उत्पादकों को बिना रसायन के जैविक रोग प्रबंधन में प्रशिक्षण देने वाली एक एनजीओ पहल।',
    tags: ['Organic', 'Training', 'Private'],
    applyUrl: 'https://www.naandi.org/',
    detailsUrl: 'https://www.naandi.org/',
  },
  // ── PUNJAB ──
  {
    id: 22, name: 'Pani Bachao Paise Kamao', name_kn: 'ಪಾನಿ ಬಚಾವೋ ಪೈಸೆ ಕಮಾವೋ', name_hi: 'पानी बचाओ पैसे कमाओ',
    state: 'Punjab', ministry: 'Punjab State Power Corporation', ministry_kn: 'ಪಂಜಾಬ್ ರಾಜ್ಯ ವಿದ್ಯುತ್ ನಿಗಮ', ministry_hi: 'पंजाब राज्य विद्युत निगम',
    amount: 'Direct cash transfer of ₹4 per unit of electricity saved below the fixed consumption limit for agriculture tube wells.',
    amount_kn: 'ಕೃಷಿ ಕೊಳವೆಬಾವಿಗಳಿಗೆ ನಿಗದಿಪಡಿಸಿದ ಬಳಕೆ ಮಿತಿಗಿಂತ ಕಡಿಮೆ ವಿದ್ಯುತ್ ಉಳಿಸಿದರೆ ಪ್ರತಿ ಯೂನಿಟ್‌ಗೆ ₹4 ರಂತೆ ನೇರ ನಗದು ವರ್ಗಾವಣೆ.',
    amount_hi: 'कृषि नलकूपों के लिए निर्धारित खपत सीमा से कम बिजली बचाने पर ₹4 प्रति यूनिट का सीधा नकद हस्तांतरण।',
    deadline: '31 Oct 2026', status: 'Open', category: 'State Scheme',
    desc: 'Punjab government scheme promoting groundwater conservation by rewarding farmers financially for saving electricity and water.',
    desc_kn: 'ರೈತರು ವಿದ್ಯುತ್ ಮತ್ತು ನೀರನ್ನು ಉಳಿಸುವುದಕ್ಕಾಗಿ ಆರ್ಥಿಕವಾಗಿ ಪ್ರೋತ್ಸಾಹಿಸುವ ಮೂಲಕ ಅಂತರ್ಜಲ ಸಂರಕ್ಷಣೆಯನ್ನು ಉತ್ತೇಜಿಸುವ ಪಂಜಾಬ್ ಸರ್ಕಾರದ ಯೋಜನೆ.',
    desc_hi: 'किसानों को बिजली और पानी बचाने के लिए वित्तीय रूप से पुरस्कृत करके भूजल संरक्षण को बढ़ावा देने वाली पंजाब सरकार की योजना।',
    tags: ['Punjab', 'Conservation', 'Water'],
    applyUrl: 'https://www.pspcl.in/',
    detailsUrl: 'https://www.pspcl.in/',
  },
  {
    id: 23, name: 'The Kalgidhar Society Organic Drive', name_kn: 'ದಿ ಕಲ್ಗಿಧರ್ ಸೊಸೈಟಿ ಸಾವಯವ ಅಭಿಯಾನ', name_hi: 'द कलगीधर सोसाइटी जैविक अभियान',
    state: 'Punjab', ministry: 'The Kalgidhar Society (NGO)', ministry_kn: 'ದಿ ಕಲ್ಗಿಧರ್ ಸೊಸೈಟಿ (NGO)', ministry_hi: 'द कलगीधर सोसाइटी (NGO)',
    amount: 'Provides bio-fertilizers, organic seeds, and free soil testing to support chemical-free wheat and paddy farming.',
    amount_kn: 'ರಾಸಾಯನಿಕ ರಹಿತ ಗೋಧಿ ಮತ್ತು ಭತ್ತದ ಕೃಷಿಯನ್ನು ಬೆಂಬಲಿಸಲು ಜೈವಿಕ ರಸಗೊಬ್ಬರಗಳು, ಸಾವಯವ ಬೀಜಗಳು ಮತ್ತು ಉಚಿತ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ.',
    amount_hi: 'रसायन मुक्त गेहूं और धान की खेती का समर्थन करने के लिए जैव-उर्वरक, जैविक बीज और मुफ्त मिट्टी परीक्षण प्रदान करता है।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Private Initiative',
    desc: 'NGO program assisting rural farmers in Punjab to transition from intensive chemical agriculture to sustainable organic farming.',
    desc_kn: 'ಪಂಜಾಬ್‌ನ ಗ್ರಾಮೀಣ ರೈತರು ತೀವ್ರ ರಾಸಾಯನಿಕ ಕೃಷಿಯಿಂದ ಸುಸ್ಥಿರ ಸಾವಯವ ಕೃಷಿಗೆ ಬದಲಾಗಲು ಸಹಾಯ ಮಾಡುವ NGO ಕಾರ್ಯಕ್ರಮ.',
    desc_hi: 'पंजाब के ग्रामीण किसानों को सघन रासायनिक कृषि से टिकाऊ जैविक खेती की ओर बढ़ने में सहायता करने वाला एनजीओ कार्यक्रम।',
    tags: ['Organic', 'Punjab', 'Sustainable'],
    applyUrl: 'https://barusahib.org/',
    detailsUrl: 'https://barusahib.org/',
  },
  // ── TAMIL NADU ──
  {
    id: 24, name: 'Kuruvai Cultivation Support Scheme', name_kn: 'ಕುರುವೈ ಬೇಸಾಯ ಬೆಂಬಲ ಯೋಜನೆ', name_hi: 'कुरुवई खेती सहायता योजना',
    state: 'Tamil Nadu', ministry: 'Tamil Nadu Agriculture Dept.', ministry_kn: 'ತಮಿಳುನಾಡು ಕೃಷಿ ಇಲಾಖೆ', ministry_hi: 'तमिलनाडु कृषि विभाग',
    amount: '100% subsidy on certified paddy seeds and chemical/bio-fertilizers up to ₹1,850 per acre for Kuruvai season.',
    amount_kn: 'ಕುರುವೈ ಹಂಗಾಮಿಗೆ ಪ್ರತಿ ಎಕರೆಗೆ ₹1,850 ರವರೆಗೆ ಪ್ರಮಾಣೀಕೃತ ಭತ್ತದ ಬೀಜಗಳು ಮತ್ತು ರಾಸಾಯನಿಕ/ಜೈವಿಕ ಗೊಬ್ಬರಗಳ ಮೇಲೆ 100% ಸಬ್ಸಿಡಿ.',
    amount_hi: 'कुरुवई सीजन के लिए प्रति एकड़ ₹1,850 तक प्रमाणित धान के बीजों और रासायनिक/जैव-उर्वरकों पर 100% सब्सिडी।',
    deadline: '31 Jul 2026', status: 'Open', category: 'State Scheme',
    desc: 'Tamil Nadu government scheme providing complete agricultural input subsidies to delta district farmers during the Kuruvai season.',
    desc_kn: 'ಕುರುವೈ ಹಂಗಾಮಿನಲ್ಲಿ ಡೆಲ್ಟಾ ಜಿಲ್ಲೆಯ ರೈತರಿಗೆ ಸಂಪೂರ್ಣ ಕೃಷಿ ಪರಿಕರಗಳ ಸಬ್ಸಿಡಿಯನ್ನು ಒದಗಿಸುವ ತಮಿಳುನಾಡು ಸರ್ಕಾರದ ಯೋಜನೆ.',
    desc_hi: 'कुरुवई सीजन के दौरान डेल्टा जिला किसानों को पूर्ण कृषि इनपुट सब्सिडी प्रदान करने वाली तमिलनाडु सरकार की योजना।',
    tags: ['Tamil Nadu', 'Seeds', 'Subsidy'],
    applyUrl: 'https://www.tn.gov.in/',
    detailsUrl: 'https://www.tn.gov.in/',
  },
  {
    id: 25, name: 'MSSRF Climate-Resilient Farming', name_kn: 'ಎಂಎಸ್ಎಸ್ಆರ್ಎಫ್ ಹವಾಮಾನ-ಸ್ಥಿತಿಸ್ಥಾಪಕ ಕೃಷಿ', name_hi: 'एमएसएसआरएफ जलवायु-अनुकूल खेती',
    state: 'Tamil Nadu', ministry: 'M. S. Swaminathan Research Foundation (NGO)', ministry_kn: 'ಎಂ. ಎಸ್. ಸ್ವಾಮಿನಾಥನ್ ಸಂಶೋಧನಾ ಪ್ರತಿಷ್ಠಾನ (NGO)', ministry_hi: 'एम. एस. स्वामीनाथन अनुसंधान प्रतिष्ठान (NGO)',
    amount: 'Supplies saline-resistant crop seeds, solar irrigation pumps, and weather advisory alerts directly to mobile phones.',
    amount_kn: 'ಲವಣಾಂಶ-ನಿರೋಧಕ ಬೆಳೆ ಬೀಜಗಳು, ಸೌರ ನೀರಾವರಿ ಪಂಪ್‌ಗಳು ಮತ್ತು ಹವಾಮಾನ ಸಲಹಾ ಎಚ್ಚರಿಕೆಗಳನ್ನು ನೇರವಾಗಿ ಮೊಬೈಲ್‌ಗೆ ಒದಗಿಸುತ್ತದೆ.',
    amount_hi: 'लवणता-प्रतिरोधी फसल के बीज, सौर सिंचाई पंप और सीधे मोबाइल फोन पर मौसम सलाहकार अलर्ट प्रदान करता है।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Private Initiative',
    desc: 'NGO initiative training coastal Tamil Nadu farmers in adapting to climate change using salinity-resistant crops and smart water harvesting.',
    desc_kn: 'ಲವಣಾಂಶ-ನಿರೋಧಕ ಬೆಳೆಗಳು ಮತ್ತು ಸ್ಮಾರ್ಟ್ ನೀರು ಕೊಯ್ಲು ಬಳಸಿ ಹವಾಮಾನ ಬದಲಾವಣೆಗೆ ಹೊಂದಿಕೊಳ್ಳಲು ತಮಿಳುನಾಡಿನ ಕರಾವಳಿ ರೈತರಿಗೆ ತರಬೇತಿ ನೀಡುವ NGO ಉಪಕ್ರಮ.',
    desc_hi: 'लवणता-प्रतिरोधी फसलों और स्मार्ट जल संचयन का उपयोग करके जलवायु परिवर्तन के अनुकूल होने के लिए तटीय तमिलनाडु के किसानों को प्रशिक्षित करने की एनजीओ पहल।',
    tags: ['Water', 'Training', 'Private'],
    applyUrl: 'https://www.mssrf.org/',
    detailsUrl: 'https://www.mssrf.org/',
  },
  // ── ANDHRA PRADESH ──
  {
    id: 26, name: 'YSR Rythu Bharosa', name_kn: 'ವೈಎಸ್ಆರ್ ರೈತು ಭರೋಸಾ', name_hi: 'वाईएसआर रायथू भरोसा',
    state: 'Andhra Pradesh', ministry: 'Andhra Pradesh Agriculture Dept.', ministry_kn: 'ಆಂಧ್ರಪ್ರದೇಶ ಕೃಷಿ ಇಲಾಖೆ', ministry_hi: 'आंध्र प्रदेश कृषि विभाग',
    amount: 'Direct financial assistance of ₹13,500 per year, which includes ₹7,500 from the state and ₹6,000 from the central government.',
    amount_kn: 'ವರ್ಷಕ್ಕೆ ₹13,500 ನೇರ ಆರ್ಥಿಕ ಸಹಾಯ, ಇದರಲ್ಲಿ ರಾಜ್ಯದಿಂದ ₹7,500 ಮತ್ತು ಕೇಂದ್ರ ಸರ್ಕಾರದಿಂದ ₹6,000 ಸೇರಿದೆ.',
    amount_hi: 'प्रति वर्ष ₹13,500 की सीधी वित्तीय सहायता, जिसमें राज्य से ₹7,500 और केंद्र सरकार से ₹6,000 शामिल हैं।',
    deadline: '31 May 2026', status: 'Open', category: 'State Scheme',
    desc: 'Andhra Pradesh state scheme providing direct financial assistance to landholding and tenant farmers to support cultivation costs.',
    desc_kn: 'ಬೇಸಾಯದ ವೆಚ್ಚವನ್ನು ಬೆಂಬಲಿಸಲು ಭೂಹಿಡುವಳಿ ಮತ್ತು ಗೇಣಿ ರೈತರಿಗೆ ನೇರ ಆರ್ಥಿಕ ಸಹಾಯವನ್ನು ಒದಗಿಸುವ ಆಂಧ್ರಪ್ರದೇಶ ರಾಜ್ಯದ ಯೋಜನೆ.',
    desc_hi: 'खेती की लागत का समर्थन करने के लिए भूमिधारक और काश्तकार किसानों को सीधे वित्तीय सहायता प्रदान करने वाली आंध्र प्रदेश राज्य की योजना।',
    tags: ['Andhra Pradesh', 'Income Support', 'State'],
    applyUrl: 'https://rythubharosa.ap.gov.in/',
    detailsUrl: 'https://rythubharosa.ap.gov.in/',
  },
  {
    id: 27, name: 'Rythu Sadhikara Samstha Natural Farming', name_kn: 'ರೈತು ಸಧಿಕಾರ ಸಂಸ್ಥೆ ನೈಸರ್ಗಿಕ ಕೃಷಿ', name_hi: 'रायथू सधकारा संस्था प्राकृतिक खेती',
    state: 'Andhra Pradesh', ministry: 'RySS (Govt-backed NGO)', ministry_kn: 'ರೈತು ಸಧಿಕಾರ ಸಂಸ್ಥೆ (NGO)', ministry_hi: 'रायथू सधकारा संस्था (NGO)',
    amount: 'Subsidized bio-inoculants (Jeevamrutha), organic seeds, and dedicated technical training by community resource persons.',
    amount_kn: 'ಸಬ್ಸಿಡಿ ದರದ ಜೈವಿಕ ಗೊಬ್ಬರಗಳು (ಜೀವಾಮೃತ), ಸಾವಯವ ಬೀಜಗಳು ಮತ್ತು ಸಮುದಾಯ ಸಂಪನ್ಮೂಲ ವ್ಯಕ್ತಿಗಳಿಂದ ತಾಂತ್ರಿಕ ತರಬೇತಿ.',
    amount_hi: 'रियायती जैव-उर्वरक (जीवामृत), जैविक बीज और सामुदायिक संसाधन व्यक्तियों द्वारा विशेष तकनीकी प्रशिक्षण।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Private Initiative',
    desc: 'A state-backed NGO program promoting Zero-Budget Natural Farming (ZBNF) to eliminate chemical inputs and reduce debt.',
    desc_kn: 'ರಾಸಾಯನಿಕ ಮುಕ್ತ ಕೃಷಿಯನ್ನು ಉತ್ತೇಜಿಸಲು ಮತ್ತು ರೈತರ ಸಾಲದ ಹೊರೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಶೂನ್ಯ ಬಂಡವಾಳ ನೈಸರ್ಗಿಕ ಕೃಷಿ (ZBNF) ಪ್ರಚಾರ ಮಾಡುವ ಯೋಜನೆ.',
    desc_hi: 'रासायनिक इनपुट को समाप्त करने और ऋण को कम करने के लिए शून्य-बजट प्राकृतिक खेती (ZBNF) को बढ़ावा देने वाला राज्य-समर्थित एनजीओ कार्यक्रम।',
    tags: ['Organic', 'Andhra Pradesh', 'Training'],
    applyUrl: 'http://apzbnf.in/',
    detailsUrl: 'http://apzbnf.in/',
  },
  // ── UTTAR PRADESH ──
  {
    id: 28, name: 'UP Pankaj Organic Krishi Subsidy', name_kn: 'ಯುಪಿ ಸಾವಯವ ಕೃಷಿ ಸಬ್ಸಿಡಿ', name_hi: 'यूपी जैविक कृषि सब्सिडी',
    state: 'UP', ministry: 'Uttar Pradesh Agriculture Dept.', ministry_kn: 'ಉತ್ತರ ಪ್ರದೇಶ ಕೃಷಿ ಇಲಾಖೆ', ministry_hi: 'उत्तर प्रदेश कृषि विभाग',
    amount: 'Provides a 75% financial subsidy up to ₹15,000 for constructing vermicompost pits and purchasing organic inputs.',
    amount_kn: 'ವರ್ಮಿಕಾಂಪೋಸ್ಟ್ (ಎರೆಗೊಬ್ಬರ) ತೊಟ್ಟಿಗಳ ನಿರ್ಮಾಣ ಮತ್ತು ಸಾವಯವ ಪರಿಕರಗಳ ಖರೀದಿಗೆ ₹15,000 ವರೆಗೆ ಶೇಕಡಾ 75 ರಷ್ಟು ಆರ್ಥಿಕ ಸಬ್ಸಿಡಿ.',
    amount_hi: 'वर्मीकम्पोस्ट गड्ढों के निर्माण और जैविक इनपुट खरीदने के लिए ₹15,000 तक 75% वित्तीय सब्सिडी प्रदान करता है।',
    deadline: '30 Sep 2026', status: 'Open', category: 'State Scheme',
    desc: 'Uttar Pradesh government scheme supporting farmers to establish organic manure units to restore soil health and fertility.',
    desc_kn: 'ಮಣ್ಣಿನ ಆಹೋರ ಮತ್ತು ಫಲವತ್ತತೆಯನ್ನು ಮರುಸ್ಥಾಪಿಸಲು ಸಾವಯವ ಗೊಬ್ಬರ ಘಟಕಗಳನ್ನು ಸ್ಥಾಪಿಸಲು ರೈತರಿಗೆ ಬೆಂಬಲ ನೀಡುವ ಉತ್ತರ ಪ್ರದೇಶ ಸರ್ಕಾರದ ಯೋಜನೆ.',
    desc_hi: 'मिट्टी के स्वास्थ्य और उर्वरता को बहाल करने के लिए जैविक खाद इकाइयों की स्थापना में किसानों की सहायता करने वाली उत्तर प्रदेश सरकार की योजना।',
    tags: ['UP', 'Organic', 'Subsidy'],
    applyUrl: 'http://upagriculture.com/',
    detailsUrl: 'http://upagriculture.com/',
  },
  {
    id: 29, name: 'Gorakhpur Environmental Action Group', name_kn: 'ಗೋರಖ್‌ಪುರ ಪರಿಸರ ಕ್ರಿಯಾ ಗುಂಪು', name_hi: 'गोरखपुर पर्यावरण एक्शन ग्रुप',
    state: 'UP', ministry: 'Gorakhpur Environmental Action Group (NGO)', ministry_kn: 'ಗೋರಖ್‌ಪುರ ಪರಿಸರ ಕ್ರಿಯಾ ಗುಂಪು (NGO)', ministry_hi: 'गोरखपुर पर्यावरण एक्शन ग्रुप (NGO)',
    amount: 'Provides bio-pesticides, flood-resilient seeds, and training on multi-cropping systems to smallholder farming families.',
    amount_kn: 'ಸಣ್ಣ ಹಿಡುವಳಿ ರೈತ ಕುಟುಂಬಗಳಿಗೆ ಜೈವಿಕ ಕೀಟನಾಶಕಗಳು, ಪ್ರವಾಹ-ನಿರೋಧಕ ಬೀಜಗಳು ಮತ್ತು ಬಹು-ಬೆಳೆ ಪದ್ಧತಿಯ ಬಗ್ಗೆ ತರಬೇತಿ ನೀಡುತ್ತದೆ.',
    amount_hi: 'छोटे किसान परिवारों को जैव-कीटनाशक, बाढ़-अनुकूल बीज और बहु-फसली प्रणालियों पर प्रशिक्षण प्रदान करता है।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Private Initiative',
    desc: 'An NGO promoting sustainable, climate-resilient agriculture and ecological farming techniques among smallholder farmers in Eastern UP.',
    desc_kn: 'ಪೂರ್ವ ಯುಪಿಯ ಸಣ್ಣ ರೈತರಲ್ಲಿ ಸುಸ್ಥಿರ, ಹವಾಮಾನ-ಸ್ಥಿತಿಸ್ಥಾಪಕ ಕೃಷಿ ಮತ್ತು ಪರಿಸರ ಕೃಷಿ ತಂತ್ರಗಳನ್ನು ಉತ್ತೇಜಿಸುವ ಸ್ವಯಂಸೇವಾ ಸಂಸ್ಥೆ.',
    desc_hi: 'पूर्वी यूपी में छोटे किसानों के बीच टिकाऊ, जलवायु-अनुकूल कृषि और पारिस्थितिक खेती तकनीकों को बढ़ावा देने वाला एक एनजीओ।',
    tags: ['Sustainable', 'Training', 'Private'],
    applyUrl: 'http://geagindia.org/',
    detailsUrl: 'http://geagindia.org/',
  },
  // ── RAJASTHAN ──
  {
    id: 30, name: 'Rajasthan Mukhyamantri Rajshri Yojana', name_kn: 'ರಾಜಸ್ಥಾನ ಮುಖ್ಯಮಂತ್ರಿ ರಾಜಶ್ರೀ ಯೋಜನೆ', name_hi: 'राजस्थान मुख्यमंत्री राजश्री योजना',
    state: 'Rajasthan', ministry: 'Rajasthan Women & Child Dept.', ministry_kn: 'ರಾಜಸ್ಥಾನ ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಇಲಾಖೆ', ministry_hi: 'राजस्थान महिला एवं बाल विभाग',
    amount: 'Financial assistance of up to ₹50,000 in installments for the health, education, and development of girls in farming families.',
    amount_kn: 'ರೈತ ಕುಟುಂಬಗಳಲ್ಲಿನ ಹೆಣ್ಣು ಮಕ್ಕಳ ಆರೋಗ್ಯ, ಶಿಕ್ಷಣ ಮತ್ತು ಅಭಿವೃದ್ಧಿಗಾಗಿ ಹಂತ ಹಂತವಾಗಿ ₹50,000 ವರೆಗೆ ಆರ್ಥಿಕ ಸಹಾಯ.',
    amount_hi: 'किसान परिवारों में बेटियों के स्वास्थ्य, शिक्षा और विकास के लिए किश्तों में ₹50,000 तक की वित्तीय सहायता।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'State Scheme',
    desc: 'Rajasthan state scheme providing financial aid to women and girl children of farming families to promote education and welfare.',
    desc_kn: 'ಶಿಕ್ಷಣ ಮತ್ತು ಕಲ್ಯಾಣವನ್ನು ಉತ್ತೇಜಿಸಲು ರೈತ ಕುಟುಂಬಗಳ ಮಹಿಳೆಯರು ಮತ್ತು ಹೆಣ್ಣು ಮಕ್ಕಳಿಗೆ ಆರ್ಥಿಕ ಸಹಾಯವನ್ನು ಒದಗಿಸುವ ರಾಜಸ್ಥಾನ ರಾಜ್ಯದ ಯೋಜನೆ.',
    desc_hi: 'शिक्षा और कल्याण को बढ़ावा देने के लिए किसान परिवारों की महिलाओं और बालिकाओं को वित्तीय सहायता प्रदान करने वाली राजस्थान राज्य की योजना।',
    tags: ['Rajasthan', 'State', 'Welfare'],
    applyUrl: 'https://rajasthan.gov.in/',
    detailsUrl: 'https://rajasthan.gov.in/',
  },
  {
    id: 31, name: 'Lupin Foundation Desert Agriculture', name_kn: 'ಲುಪಿನ್ ಫೌಂಡೇಶನ್ ಮರುಭೂಮಿ ಕೃಷಿ', name_hi: 'ल्यूपिन फाउंडेशन मरुस्थल कृषि',
    state: 'Rajasthan', ministry: 'Lupin Human Welfare Foundation (NGO)', ministry_kn: 'ಲುಪಿನ್ ಫೌಂಡೇಶನ್ (NGO)', ministry_hi: 'ल्यूपिन फाउंडेशन (NGO)',
    amount: 'Subsidized rainwater harvesting tanks (Taankas), drip systems, and drought-resistant fruit saplings like Ber and Gunda.',
    amount_kn: 'ಸಬ್ಸಿಡಿ ದರದ ಮಳೆನೀರು ಕೊಯ್ಲು ತೊಟ್ಟಿಗಳು (ಟಾಕಾಗಳು), ಹನಿ ನೀರಾವರಿ ಮತ್ತು ಬರ-ನಿರೋಧಕ ಹಣ್ಣಿನ ಸಸಿಗಳ (ಬೋರ್, ಗುಂಡಾ) ವಿತರಣೆ.',
    amount_hi: 'रियायती वर्षा जल संचयन टैंक (टांका), ड्रिप प्रणाली, और बेर और गुंडा जैसे सूखा-प्रतिरोधी फलों के पौधे।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Private Initiative',
    desc: 'NGO initiative supporting arid land farmers in Rajasthan with water conservation structures and drought-tolerant horticulture.',
    desc_kn: 'ರಾಜಸ್ಥಾನದ ಶುಷ್ಕ ಭೂಮಿ ರೈತರಿಗೆ ನೀರು ಸಂರಕ್ಷಣೆ ಮತ್ತು ಬರ-ನಿರೋಧಕ ತೋಟಗಾರಿಕಾ ತಂತ್ರಜ್ಞಾನಗಳ ಮೂಲಕ ಬೆಂಬಲ ನೀಡುವ NGO ಉಪಕ್ರಮ.',
    desc_hi: 'राजस्थान के शुष्क भूमि किसानों को जल संरक्षण संरचनाओं और सूखा-सहिष्णु बागवानी के माध्यम से सहायता करने वाली एनजीओ पहल।',
    tags: ['Water', 'Horticulture', 'Private'],
    applyUrl: 'http://www.lupinfoundation.in/',
    detailsUrl: 'http://www.lupinfoundation.in/',
  },
  // ── GUJARAT ──
  {
    id: 32, name: 'Gujarat Saat Pagla Kalyanna', name_kn: 'ಗುಜರಾತ್ ಸಾತ್ ಪಗ್ಲಾ ಕಲ್ಯಾಣ್', name_hi: 'गुजरात सात पगला कल्याण',
    state: 'Gujarat', ministry: 'Gujarat Agriculture Dept.', ministry_kn: 'ಗುಜರಾತ್ ಕೃಷಿ ಇಲಾಖೆ', ministry_hi: 'गुजरात कृषि विभाग',
    amount: 'Provides a 100% financial subsidy up to ₹50,000 for farm storage structures and crop transport subsidies.',
    amount_kn: 'ಕೃಷಿ ದಾಸ್ತಾನು ಜಾಗಗಳ ನಿರ್ಮಾಣಕ್ಕಾಗಿ ಮತ್ತು ಬೆಳೆ ಸಾಗಾಣಿಕಾ ವೆಚ್ಚದ ಮೇಲೆ ₹50,000 ವರೆಗೆ ಸಂಪೂರ್ಣ 100% ಸಬ್ಸಿಡಿ.',
    amount_hi: 'कृषि भंडारण संरचनाओं और फसल परिवहन सब्सिडी के लिए ₹50,000 तक 100% वित्तीय सब्सिडी प्रदान करता है।',
    deadline: '30 Nov 2026', status: 'Open', category: 'State Scheme',
    desc: 'Gujarat government scheme offering seven steps of welfare, including storage facility subsidies and mobile crop selling carts.',
    desc_kn: 'ದಾಸ್ತಾನು ಸೌಲಭ್ಯ ಸಬ್ಸಿಡಿಗಳು ಮತ್ತು ಬೆಳೆ ಮಾರಾಟದ ಮೊಬೈಲ್ ಕಾರ್ಟ್‌ಗಳು ಸೇರಿದಂತೆ ಏಳು ಹಂತಗಳ ಕಲ್ಯಾಣ ಸೌಲಭ್ಯಗಳನ್ನು ನೀಡುವ ಗುಜರಾತ್ ಸರ್ಕಾರದ ಯೋಜನೆ.',
    desc_hi: 'भंडारण सुविधा सब्सिडी और मोबाइल फसल बिक्री कार्ट सहित कल्याण के सात कदम प्रदान करने वाली गुजरात सरकार की योजना।',
    tags: ['Gujarat', 'Subsidy', 'Infrastructure'],
    applyUrl: 'https://ikhedut.gujarat.gov.in/',
    detailsUrl: 'https://ikhedut.gujarat.gov.in/',
  },
  {
    id: 33, name: 'SEWA Organic Mahila Agriculture', name_kn: 'ಸೇವಾ ಸಾವಯವ ಮಹಿಳಾ ಕೃಷಿ', name_hi: 'सेवा जैविक महिला कृषि',
    state: 'Gujarat', ministry: 'Self Employed Womens Association (NGO)', ministry_kn: 'ಸೇವಾ ಸ್ವಯಂ ಉದ್ಯೋಗಿ ಮಹಿಳಾ ಸಂಘ (NGO)', ministry_hi: 'सेवा स्व-नियोजित महिला संघ (NGO)',
    amount: 'Establishes community seed banks, provides organic pesticide kits, and offers direct market linkage for organic produce.',
    amount_kn: 'ಸಮುದಾಯ ಬೀಜ ಬ್ಯಾಂಕ್‌ಗಳ ಸ್ಥಾಪನೆ, ಸಾವಯವ ಕೀಟನಾಶಕ ಕಿಟ್‌ಗಳ ವಿತರಣೆ ಮತ್ತು ಸಾವಯವ ಉತ್ಪನ್ನಗಳಿಗೆ ನೇರ ಮಾರುಕಟ್ಟೆ ಸಂಪರ್ಕ ಒದಗಿಸುತ್ತದೆ.',
    amount_hi: 'सामुदायिक बीज बैंकों की स्थापना, जैविक कीटनाशक किट, और जैविक उत्पादों के लिए सीधे बाजार संपर्क प्रदान करता है।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Private Initiative',
    desc: 'An NGO cooperative training and supporting smallholder women farmers in Gujarat in organic agriculture and collective marketing.',
    desc_kn: 'ಗುಜರಾತ್‌ನ ಸಣ್ಣ ಹಿಡುವಳಿ ಮಹಿಳಾ ರೈತರಿಗೆ ಸಾವಯವ ಕೃಷಿ ಮತ್ತು ಸಾಮೂಹಿಕ ಮಾರಾಟದಲ್ಲಿ ತರಬೇತಿ ಹಾಗೂ ಬೆಂಬಲ ನೀಡುವ NGO ಸಹಕಾರ ಸಂಘ.',
    desc_hi: 'गुजरात में छोटी महिला किसानों को जैविक कृषि और सामूहिक विपणन में प्रशिक्षित और सहायता करने वाली एक एनजीओ सहकारी संस्था।',
    tags: ['Organic', 'Training', 'Private'],
    applyUrl: 'https://www.sewa.org/',
    detailsUrl: 'https://www.sewa.org/',
  },
  // ── WEST BENGAL ──
  {
    id: 34, name: 'Krishak Bandhu Scheme', name_kn: 'ಕೃಷಕ ಬಂಧು ಯೋಜನೆ', name_hi: 'कृषक बंधु योजना',
    state: 'West Bengal', ministry: 'West Bengal Agriculture Dept.', ministry_kn: 'ಪಶ್ಚಿಮ ಬಂಗಾಳ ಕೃಷಿ ಇಲಾಖೆ', ministry_hi: 'पश्चिम बंगाल कृषि विभाग',
    amount: 'Financial assistance of up to ₹10,000 per year for landowners, and a life insurance death benefit of ₹2,00,000.',
    amount_kn: 'ಭೂಮಾಲೀಕರಿಗೆ ವರ್ಷಕ್ಕೆ ₹10,000 ವರೆಗೆ ಆರ್ಥಿಕ ಸಹಾಯ, ಮತ್ತು ರೈತ ಮರಣ ಹೊಂದಿದಲ್ಲಿ ₹2,00,000 ಜೀವ ವಿಮಾ ಪರಿಹಾರ.',
    amount_hi: 'भूस्वामियों के लिए प्रति वर्ष ₹10,000 तक की वित्तीय सहायता, और ₹2,00,000 का जीवन बीमा मृत्यु लाभ।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'State Scheme',
    desc: 'West Bengal government scheme providing financial support and life insurance coverage to farming families.',
    desc_kn: 'ರೈತ ಕುಟುಂಬಗಳಿಗೆ ಆರ್ಥಿಕ ಬೆಂಬಲ ಮತ್ತು ಆಕಸ್ಮಿಕ ಜೀವ ವಿಮಾ ರಕ್ಷಣೆಯನ್ನು ಒದಗಿಸುವ ಪಶ್ಚಿಮ ಬಂಗಾಳ ಸರ್ಕಾರದ ಯೋಜನೆ.',
    desc_hi: 'किसान परिवारों को वित्तीय सहायता और जीवन बीमा कवरेज प्रदान करने वाली पश्चिम बंगाल सरकार की योजना।',
    tags: ['West Bengal', 'Income Support', 'Insurance'],
    applyUrl: 'https://krishakbandhu.wb.gov.in/',
    detailsUrl: 'https://krishakbandhu.wb.gov.in/',
  },
  {
    id: 35, name: 'DRCSC Sustainable Agriculture Project', name_kn: 'ಡಿಆರ್‌ಸಿಎಸ್‌ಸಿ ಸುಸ್ಥಿರ ಕೃಷಿ ಯೋಜನೆ', name_hi: 'डीआरसीएससी सतत कृषि परियोजना',
    state: 'West Bengal', ministry: 'DRCSC (NGO)', ministry_kn: 'ಡಿಆರ್‌ಸಿಎಸ್‌ಸಿ (NGO)', ministry_hi: 'डीआरसीएससी (NGO)',
    amount: 'Bio-diversity farming kits, rainwater harvesting pond liners, and training on integrated organic farming.',
    amount_kn: 'ಜೈವಿಕ ವೈವಿಧ್ಯಮಯ ಕೃಷಿ ಕಿಟ್‌ಗಳು, ಮಳೆನೀರು ಸಂಗ್ರಹಣೆ ಹೊಂಡದ ಲೈನರ್‌ಗಳು ಮತ್ತು ಸಮಗ್ರ ಸಾವಯವ ಕೃಷಿಯ ತರಬೇತಿ.',
    amount_hi: 'जैव-विविधता कृषि किट, वर्षा जल संचयन तालाब लाइनर, और एकीकृत जैविक खेती पर प्रशिक्षण।',
    deadline: 'Ongoing', status: 'Ongoing', category: 'Private Initiative',
    desc: 'NGO project promoting bio-diverse integrated farming, organic pest management, and climate adaptation in West Bengal.',
    desc_kn: 'ಪಶ್ಚಿಮ ಬಂಗಾಳದಲ್ಲಿ ಜೀವವೈವಿಧ್ಯ ಸಮಗ್ರ ಕೃಷಿ, ಸಾವಯವ ಕೀಟ ನಿರ್ವಹಣೆ ಮತ್ತು ಹವಾಮಾನ ಹೊಂದಾಣಿಕೆಯನ್ನು ಉತ್ತೇಜಿಸುವ NGO ಯೋಜನೆ.',
    desc_hi: 'पश्चिम बंगाल में जैव-विविध एकीकृत खेती, जैविक कीट प्रबंधन और जलवायु अनुकूलन को बढ़ावा देने वाली एनजीओ परियोजना।',
    tags: ['Sustainable', 'Organic', 'Private'],
    applyUrl: 'http://www.drcsc.org/',
    detailsUrl: 'http://www.drcsc.org/',
  }
];

const getCategoryTranslation = (cat, lang) => {
  const mapping = {
    'Income Support': { kn: 'ಆದಾಯ ಬೆಂಬಲ', hi: 'आय सहायता' },
    'Insurance': { kn: 'ಬೆಳೆ ವಿಮೆ', hi: 'फसल बीमा' },
    'Credit': { kn: 'ಸಾಲ ಸೌಲಭ್ಯ', hi: 'ऋण सुविधा' },
    'State Scheme': { kn: 'ರಾಜ್ಯ ಯೋಜನೆ', hi: 'राज्य योजना' },
    'Pension': { kn: 'ಪಿಂಚಣಿ ಯೋಜನೆ', hi: 'पेंशन योजना' },
    'Irrigation': { kn: 'ನೀರಾವರಿ', hi: 'सिंचाई' },
    'Organic Farming': { kn: 'ಸಾವಯವ ಕೃಷಿ', hi: 'जैविक खेती' },
    'Machinery': { kn: 'ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ', hi: 'कृषि मशीनरी' },
    'Aquaculture': { kn: 'ಮೀನುಗಾರಿಕೆ', hi: 'मत्स्य पालन' },
    'Horticulture': { kn: 'ತೋಟಗಾರಿಕೆ', hi: 'बागवानी' },
    'Crop Protection': { kn: 'ಬೆಳೆ ಸಂರಕ್ಷಣೆ', hi: 'फसल सुरक्षा' },
    'Private Initiative': { kn: 'ಖಾಸಗಿ ಉಪಕ್ರಮ', hi: 'निजी पहल' },
    'Soil Health': { kn: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ', hi: 'ಮೃದಾ ಸ್ವಾಸ್ಥ್ಯ್' },
  };
  return mapping[cat]?.[lang] || cat;
};

const getTagTranslation = (tag, lang) => {
  const mapping = {
    'Income': { kn: 'ಆದಾಯ', hi: 'आय' },
    'Central': { kn: 'ಕೇಂದ್ರ', hi: 'केंद्रीय' },
    'Annual': { kn: 'ವಾರ್ಷಿಕ', hi: 'वार्षिक' },
    'Insurance': { kn: 'ವಿಮೆ', hi: 'बीमा' },
    'Crops': { kn: 'ಬೆಳೆಗಳು', hi: 'फसलें' },
    'Risk': { kn: 'ಅಪಾಯ', hi: 'जोखिम' },
    'Credit': { kn: 'ಸಾಲ', hi: 'ऋण' },
    'Loan': { kn: 'ಸಾಲ', hi: 'कर्ज' },
    'Interest Subvention': { kn: 'ಬಡ್ಡಿ ರಿಯಾಯಿತಿ', hi: 'ब्याज छूट' },
    'Karnataka': { kn: 'ಕರ್ನಾಟಕ', hi: 'कर्नाटक' },
    'State': { kn: 'ರಾಜ್ಯ', hi: 'राज्य' },
    'Compensation': { kn: 'ಪರಿಹಾರ', hi: 'मुनावजा' },
    'Pension': { kn: 'ಪಿಂಚಣಿ', hi: 'पेंशन' },
    'Social Security': { kn: 'ಸಾಮಾಜಿಕ ಭದ್ರತೆ', hi: 'सामाजिक सुरक्षा' },
    'Old Age': { kn: 'ವೃದ್ಧಾಪ್ಯ', hi: 'वृद्धावस्था' },
    'Irrigation': { kn: 'ನೀರಾವರಿ', hi: 'सिंचाई' },
    'Drip': { kn: 'ಹನಿ ನೀರಾವರಿ', hi: 'टपकन' },
    'Subsidy': { kn: 'ಸಬ್ಸಿಡಿ', hi: 'सब्सिडी' },
    'Organic': { kn: 'ಸಾವಯವ', hi: 'जैविक' },
    'Sustainable': { kn: 'ಸುಸ್ಥಿರ', hi: 'सतत' },
    'Machinery': { kn: 'ಯಂತ್ರೋಪಕರಣ', hi: 'मशीनरी' },
    'Tractors': { kn: 'ಟ್ರಾಕ್ಟರ್ಸ್', hi: 'ट्रैक्टर' },
    'Aquaculture': { kn: 'ಜಲಚರ ಸಾಕಣೆ', hi: 'मत्स्य पालन' },
    'Fisheries': { kn: 'ಮೀನುಗಾರಿಕೆ', hi: 'मत्स्य पालन' },
    'Infrastructure': { kn: 'ಮೂಲಸೌಕರ್ಯ', hi: 'बुनियादी ढांचा' },
    'Accident Cover': { kn: 'ಅಪಘಾತ ರಕ್ಷಣೆ', hi: 'दुर्घटना कवर' },
    'Water': { kn: 'ನೀರು', hi: 'पानी' },
    'Greenhouse': { kn: 'ಹಸಿರುಮನೆ', hi: 'ग्रीनहाउस' },
    'Orchards': { kn: 'ತೋಟಗಳು', hi: 'बागान' },
    'Startup': { kn: 'ಸ್ಟಾರ್ಟ್ಅಪ್', hi: 'स्टार्टअप' },
    'Business': { kn: 'ವ್ಯವಹಾರ', hi: 'व्यवसाय' },
    'Weather': { kn: 'ಹವಾಮಾನ', hi: 'मौसम' },
    'Pest Control': { kn: 'ಕೀಟ ನಿಯಂತ್ರಣ', hi: 'कीट नियंत्रण' },
    'Training': { kn: 'ತರಬೇತಿ', hi: 'प्रशिक्षण' },
    'Private': { kn: 'ಖಾಸಗಿ', hi: 'निजी' },
    'Disease Control': { kn: 'ರೋಗ ನಿಯಂತ್ರಣ', hi: 'रोग नियंत्रण' },
    'Soil': { kn: 'ಮಣ್ಣು', hi: 'मिट्टी' },
    'Fertilizer': { kn: 'ರಸಗೊಬ್ಬರ', hi: 'उर्वरक' },
    'Testing': { kn: 'ಪರೀಕ್ಷೆ', hi: 'परीक्षण' },
    'Refinance': { kn: 'ಮರುಕಡಿತ', hi: 'पुनर्वित्त' },
  };
  return mapping[tag]?.[lang] || tag;
};

// Details modal
const DetailsModal = ({ scheme, onClose }) => {
  const { t } = useTranslation();
  const activeLanguage = useAppStore((s) => s.language) || 'en';
  if (!scheme) return null;

  const name = activeLanguage === 'kn' ? scheme.name_kn : activeLanguage === 'hi' ? scheme.name_hi : scheme.name;
  const desc = activeLanguage === 'kn' ? scheme.desc_kn : activeLanguage === 'hi' ? scheme.desc_hi : scheme.desc;
  const amount = activeLanguage === 'kn' ? scheme.amount_kn : activeLanguage === 'hi' ? scheme.amount_hi : scheme.amount;
  const ministry = activeLanguage === 'kn' ? scheme.ministry_kn : activeLanguage === 'hi' ? scheme.ministry_hi : scheme.ministry;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 280, damping: 25 }}
          className="w-full max-w-md rounded-2xl p-6 relative"
          style={{ background: '#1c211e', border: '1px solid rgba(42,56,41,0.5)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(42,56,41,0.5)', color: '#7a9080' }}>
            <X size={14} />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.12)' }}>
              <IndianRupee size={18} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: '#e8eee9' }}>{name}</h3>
              <p className="text-[11px]" style={{ color: '#6a8070' }}>{ministry}</p>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: '#96a899' }}>{desc}</p>
          <div className="rounded-xl p-3 mb-4 space-y-2" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#6a8070' }}>{t('schemes.benefit') || 'Benefit'}</span>
              <span className="font-semibold" style={{ color: '#22c55e' }}>{amount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#6a8070' }}>{t('schemes.status') || 'Status'}</span>
              <span style={{ color: scheme.status === 'Open' ? '#22c55e' : '#fbbf24' }}>
                {scheme.status === 'Open' ? (t('schemes.statusOpen') || 'Open') : (t('schemes.statusOngoing') || 'Ongoing')}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#6a8070' }}>{t('schemes.state') || 'State'}</span>
              <span style={{ color: '#c8d5ca' }}>{t(scheme.state) || scheme.state}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mb-5">
            {scheme.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[11px]"
                style={{ background: 'rgba(42,56,41,0.5)', color: '#6a8070' }}>{getTagTranslation(tag, activeLanguage)}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => window.open(scheme.applyUrl, '_blank', 'noopener,noreferrer')}
              className="btn-primary flex-1 justify-center text-[12px] py-2.5 flex items-center gap-2"
            >
              {t('applyNow') || 'Apply Now'} <ExternalLink size={11} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => window.open(scheme.detailsUrl, '_blank', 'noopener,noreferrer')}
              className="btn-secondary text-[12px] py-2.5 px-3 flex items-center gap-2"
            >
              {t('schemes.officialSite') || 'Official Site'} <ExternalLink size={11} />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 240, damping: 22, delay: i * 0.03 } }),
  exit: { opacity: 0, y: -12, scale: 0.95, transition: { duration: 0.2 } },
};

const SchemesPage = () => {
  const { t } = useTranslation();
  const activeLanguage = useAppStore((s) => s.language) || 'en';
  const [search, setSearch]     = useState('');
  const [state, setState]       = useState('All States');
  const [category, setCategory] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Categories extraction
  const categories = ['All', ...new Set(SCHEMES.map((s) => s.category))];

  const filtered = SCHEMES.filter((s) => {
    const q = search.toLowerCase();
    
    // Multi-lingual search support
    const matchSearch = 
      s.name.toLowerCase().includes(q) || 
      (s.name_kn && s.name_kn.toLowerCase().includes(q)) ||
      (s.name_hi && s.name_hi.toLowerCase().includes(q)) ||
      s.desc.toLowerCase().includes(q) ||
      (s.desc_kn && s.desc_kn.toLowerCase().includes(q)) ||
      (s.desc_hi && s.desc_hi.toLowerCase().includes(q)) ||
      s.tags.some((tag) => tag.toLowerCase().includes(q));

    // State filtering: 'All States' dropdown shows all. A selected state shows its specific ones AND 'All States' ones.
    const matchState = state === 'All States' || s.state === state || s.state === 'All States';
    const matchCat = category === 'All' || s.category === category;
    
    return matchSearch && matchState && matchCat;
  });

  const handleApplyNow = (scheme) => {
    window.open(scheme.applyUrl, '_blank', 'noopener,noreferrer');
    toast.success(`Opening ${activeLanguage === 'kn' ? scheme.name_kn : activeLanguage === 'hi' ? scheme.name_hi : scheme.name} application...`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Details Modal */}
      {selectedScheme && <DetailsModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
        <h2 className="text-lg font-bold" style={{ color: 'var(--ag-text)', letterSpacing: '-0.02em' }}>
          {t('schemesTitle') || 'Government Agricultural Schemes'}
        </h2>
        <p className="text-[13px] mt-1" style={{ color: 'var(--ag-text-dim)' }}>
          {t('schemes.subtitle') || 'Discover government schemes & subsidies available for farmers'}
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 22 }}
        className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ag-text-dim)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('schemes.search') || "Search schemes..."} className="input-field pl-9 h-10 text-xs w-full" />
        </div>
        <div className="relative">
          <select value={state} onChange={(e) => setState(e.target.value)}
            className="input-field pr-8 h-10 appearance-none cursor-pointer text-xs" style={{ minWidth: 152 }}>
            {STATES.map((s) => <option key={s} value={s}>{t(s) || s}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#6a8070' }} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c, i) => (
            <motion.button key={c} onClick={() => setCategory(c)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.02, type: 'spring', stiffness: 300 }}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors"
              style={{ background: category === c ? '#22c55e' : 'rgba(42,56,41,0.4)', color: category === c ? 'white' : '#7a9080' }}>
              {c === 'All' ? (t('All') || 'All') : getCategoryTranslation(c, activeLanguage)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.p key={filtered.length} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-[11px]" style={{ color: '#4a6050' }}>
        Showing {filtered.length} of {SCHEMES.length} schemes
      </motion.p>

      {/* Card Grid */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div key="grid" className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((scheme, i) => {
                const name = activeLanguage === 'kn' ? scheme.name_kn : activeLanguage === 'hi' ? scheme.name_hi : scheme.name;
                const desc = activeLanguage === 'kn' ? scheme.desc_kn : activeLanguage === 'hi' ? scheme.desc_hi : scheme.desc;
                const amount = activeLanguage === 'kn' ? scheme.amount_kn : activeLanguage === 'hi' ? scheme.amount_hi : scheme.amount;
                const ministry = activeLanguage === 'kn' ? scheme.ministry_kn : activeLanguage === 'hi' ? scheme.ministry_hi : scheme.ministry;
                return (
                  <motion.div key={scheme.id} custom={i} variants={cardVariants}
                    initial="hidden" animate="visible" exit="exit" layout
                    whileHover={{ y: -5, scale: 1.015, boxShadow: '0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(34,197,94,0.1)', transition: { duration: 0.2 } }}
                    className="rounded-2xl p-5 flex flex-col justify-between"
                    style={{ background: '#1c211e', border: '1px solid rgba(42,56,41,0.4)', cursor: 'default', minHeight: 260 }}>
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(34,197,94,0.1)' }}>
                          <IndianRupee size={16} style={{ color: '#22c55e' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[13px] font-semibold leading-tight text-white">{name}</h3>
                          <p className="text-[11px] mt-0.5" style={{ color: '#6a8070' }}>{ministry}</p>
                          <span className={`chip text-[11px] flex-shrink-0 flex items-center gap-1 mt-1.5 inline-flex ${scheme.status === 'Open' ? 'chip-success' : 'chip-info'}`}>
                            {scheme.status === 'Open' ? <CheckCircle size={9} /> : <Clock size={9} />}
                            {scheme.status === 'Open' ? (t('schemes.statusOpen') || 'Open') : (t('schemes.statusOngoing') || 'Ongoing')}
                          </span>
                        </div>
                      </div>

                      <p className="text-[12px] leading-relaxed mb-3 text-[#96a899]">{desc}</p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {scheme.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-[11px]"
                            style={{ background: 'rgba(42,56,41,0.5)', color: '#6a8070' }}>{getTagTranslation(tag, activeLanguage)}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-col text-[12px] mb-4 pt-2 border-t border-white/5 gap-1">
                        <div>
                          <span style={{ color: '#6a8070' }}>{t('schemes.benefit') || 'Benefit'}: </span>
                          <span className="font-semibold text-green-400">{amount}</span>
                        </div>
                        <div className="flex justify-between text-[11px] mt-1" style={{ color: '#6a8070' }}>
                          <span>{t('schemes.state') || 'State'}: {t(scheme.state) || scheme.state}</span>
                          <span>{scheme.deadline !== 'Ongoing' ? `${t('schemes.by') || 'By'}: ${scheme.deadline}` : scheme.deadline}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => handleApplyNow(scheme)}
                          className="btn-primary flex-1 justify-center text-[12px] py-2 flex items-center gap-1.5">
                          {t('applyNow') || 'Apply Now'} <ExternalLink size={11} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                          onClick={() => setSelectedScheme(scheme)}
                          className="btn-secondary text-[12px] py-2 px-3">
                          {t('viewDetails') || 'Details'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }} className="py-20 text-center">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
              <FileText size={36} style={{ color: '#22c55e', opacity: 0.35, margin: '0 auto 12px' }} />
            </motion.div>
            <p className="text-sm" style={{ color: '#6a8070' }}>No schemes match your search</p>
            <button onClick={() => { setSearch(''); setCategory('All'); setState('All States'); }}
              className="text-[12px] mt-3" style={{ color: '#22c55e' }}>
              Reset filters →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SchemesPage;
