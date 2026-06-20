const fs = require('fs');
const path = '/Users/codethrust27/Desktop/codingProfileTracker-backend/codeprofile-aggregator/backend/controllers/subscriptionController.js';
let content = fs.readFileSync(path, 'utf8');

const target = `// --- EMAIL NOTIFICATION SYSTEM ---`;
const newBlock = `// --- EMAIL NOTIFICATION SYSTEM ---
        const planDisplayName = PLANS[tier].name;
        const paidAmount = selectedPlan.price;
        const formattedDate = expiresAt.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const featuresText = tier === 'tcs_nqt' 
            ? 'Your TCS NQT Pass is now active. You have full access to all theory, practice questions, and mock tests in the TCS NQT Guide.'
            : 'Your dashboard now highlights your active premium subscriber tier with dynamic glowing badges! You also have full tracking enabled for **GeeksforGeeks** (including institute ranks and streaks), dynamic **Codeforces** status checks, and expanded **AI Profile Coach Analysis**.';

        // 1. Email to the Subscribed User
        const userEmailHtml = \`
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #020617; color: #ffffff; padding: 40px 20px; text-align: center;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 24px; padding: 40px; text-align: left; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <span style="font-size: 50px;">🎉</span>
                        <h2 style="color: #22d3ee; margin-top: 10px; font-weight: 900; font-size: 28px; letter-spacing: -0.5px;">Welcome to CodeProfile \${tier.toUpperCase()}!</h2>
                        <p style="color: #94a3b8; font-size: 14px;">Your subscription has been successfully verified and activated.</p>
                    </div>

                    <hr style="border: 0; border-top: 1px solid #1e293b; margin: 30px 0;" />

                    <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">Subscription Details</h3>
                    <div style="background-color: #020617; border: 1px solid #1e293b; padding: 20px; border-radius: 16px; margin-bottom: 30px;">
                        <table style="width: 100%; font-size: 14px; color: #cbd5e1; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 6px 0; color: #94a3b8;">Tier:</td>
                                <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">\${planDisplayName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #94a3b8;">Duration:</td>
                                <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">\${plan}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #94a3b8;">Amount Paid:</td>
                                <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #22d3ee;">₹\${paidAmount}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #94a3b8;">Transaction UTR:</td>
                                <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 13px; color: #ffffff;">\${utr}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0 0 0; color: #94a3b8; border-t: 1px dashed #1e293b;">Valid Until:</td>
                                <td style="padding: 10px 0 0 0; text-align: right; font-weight: bold; color: #10b981; border-t: 1px dashed #1e293b;">\${formattedDate}</td>
                            </tr>
                        </table>
                    </div>

                    <p style="color: #cbd5e1; font-size: 14px; leading-relaxed;">
                        \${featuresText}
                    </p>

                    <div style="text-align: center; margin-top: 40px;">
                        <a href="http://localhost:5173/dashboard" style="background-color: #22d3ee; color: #020617; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Go to Dashboard 🚀</a>
                    </div>
                </div>
            </div>
        \`;`;

let startIndex = content.indexOf('// --- EMAIL NOTIFICATION SYSTEM ---');
let endIndex = content.indexOf('        // 2. Email to the Admins');
content = content.slice(0, startIndex) + newBlock + '\n' + content.slice(endIndex);
fs.writeFileSync(path, content);
