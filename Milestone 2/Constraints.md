#Constraints


1. Team size: 
Remains the same with no changes required.

2. Schedule/Deadline:
All deadline dates found. Added to PED:
Project Milestoen 1: 09 September 2026
Project Milestone 2: 30 September 2026
Project Milestone 3: 14 October 2026
Final Project:      18 October 2026

3. Cost:
Remains the same as we have no budget outside of our own pocket.
However this influences what technology as it should be free or have a free version. Live SMS and WhatsApp are paid services however because we are only simulating these serves they remain free of charge and do not affect our budget.

4. Scope:
Scope remains the same however what should be noted are the deferred decision that have been resolved mainly the SMS and WhatsApp notifications that will be simulated, while the live server remains deferred. These changes have already been documented and approved.

5. Security:
Based on research and decision our security constraint also changed, no passwords, API keys or other sensitive data may be committed to GitHub repo. If we ever make use of outside sources to handle the SMS or WhatsApp notification we should ensure to remain in the correct legal standing and follow the laws of the region, in our case POPIA requires a written contract to obligate in keeping the data secure.

6. Quality:
The system must meet our given quality standards, not just work. Our current quality constraints fall under 3 of our requirements, NFR-PERF-001, NFR-SEC- and NFR-AUD-001. 

Trade-offs: 
Cost and realism:
We are limited by our budget meaning we are unable to make use of an actual live WhatsApp and SMS service. Therefore we chose to simulate these notifications and interactions. 
Quality and cost:
Quality asks for fast response while cost forces us to remain with free hosting, which can be slow at times. A Target set such as 95% of requests within 2 seconds would be hard to meet under these conditions. Thus we have chosen to change this and rather have 90% of requests within 4 seconds while 2 seconds still being kept as a goal we hope to achieve. 
