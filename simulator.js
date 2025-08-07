document.addEventListener('DOMContentLoaded', async () => {
    
    // --- FETCH DATA FROM EXTERNAL JSON FILES ---
    const [diseaseData, structuredSymptoms] = await Promise.all([
        fetch('data/diseases.json').then(res => res.json()).catch(err => { console.error("Error fetching diseases:", err); return []; }),
        fetch('data/symptoms.json').then(res => res.json()).catch(err => { console.error("Error fetching symptoms:", err); return []; })
    ]);

    const symptomsContainer = document.getElementById('symptoms-checkbox-container');
    const form = document.getElementById('diagnosis-form');
    const resultsContainer = document.getElementById('results-container');
    const searchInput = document.getElementById('symptom-search');
    const selectedSymptomsBar = document.getElementById('selected-symptoms-bar');
    const clearButton = document.getElementById('clear-button');

    // --- Populate Symptoms ---
    const populateSymptoms = (symptomsData) => {
        if (!symptomsContainer || !symptomsData || symptomsData.length === 0) {
            if(symptomsContainer) symptomsContainer.innerHTML = '<p style="color:red; text-align:center;"><strong>Could not load symptoms.</strong><br>Please check the data source and ensure the server is running.</p>';
            return;
        }

        let content = '';
        symptomsData.forEach(systemCategory => {
            content += `
                <div class="symptom-category">
                    <h3 class="symptom-category-title">${systemCategory.system}</h3>
                    <div class="symptoms-grid">
            `;

            systemCategory.symptoms.forEach(symptom => {
                content += `<div class="symptom-item-complex" data-symptom-key="${symptom.key}">`;
                content += `
                    <div class="primary-symptom">
                        <input type="checkbox" id="${symptom.key}" name="symptoms" value="${symptom.key}" class="primary-symptom-checkbox">
                        <label for="${symptom.key}">${symptom.label}</label>
                    </div>
                `;
                if (symptom.subOptions && symptom.subOptions.length > 0) {
                    content += `<div class="sub-options-container" id="${symptom.key}-sub-options">`;
                    if (symptom.question) {
                        content += `<div class="sub-option-question">${symptom.question}</div>`;
                    }
                    symptom.subOptions.forEach((subOption, index) => {
                        const subId = `${symptom.key}_${index}`;
                        content += `
                            <div class="sub-option">
                                <input type="radio" id="${subId}" name="${symptom.key}_specifier" value="${subOption.toLowerCase().replace(/ /g, '_')}">
                                <label for="${subId}">${subOption}</label>
                            </div>
                        `;
                    });
                    content += `</div>`;
                }
                content += `</div>`;
            });

            content += `</div></div>`;
        });
        
        symptomsContainer.innerHTML = content;
        symptomsContainer.style.display = 'block';
    };
    
    // --- UI Interaction Logic ---
    const updateSymptomTag = (key, label, isChecked) => {
        if (!selectedSymptomsBar) return;
        if (isChecked) {
            const tag = document.createElement('span');
            tag.className = 'symptom-tag';
            tag.dataset.symptomKey = key;
            tag.innerHTML = `${label} <button class="remove-tag" data-key="${key}">&times;</button>`;
            selectedSymptomsBar.appendChild(tag);
        } else {
            const tagToRemove = selectedSymptomsBar.querySelector(`.symptom-tag[data-symptom-key="${key}"]`);
            if (tagToRemove) {
                selectedSymptomsBar.removeChild(tagToRemove);
            }
        }
    };

    if(symptomsContainer){
        symptomsContainer.addEventListener('change', (event) => {
            if (event.target.classList.contains('primary-symptom-checkbox')) {
                const complexItem = event.target.closest('.symptom-item-complex');
                const subOptionsContainer = complexItem.querySelector('.sub-options-container');
                const label = complexItem.querySelector('label').textContent;

                updateSymptomTag(event.target.value, label, event.target.checked);

                if (subOptionsContainer) {
                    subOptionsContainer.classList.toggle('active', event.target.checked);
                    complexItem.classList.toggle('active', event.target.checked);
                }
            }
        });
    }
    
    if(selectedSymptomsBar){
        selectedSymptomsBar.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-tag')) {
                const key = event.target.dataset.key;
                const checkbox = document.getElementById(key);
                if (checkbox) {
                    checkbox.checked = false;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });
    }

    if(clearButton && form && selectedSymptomsBar && resultsContainer) {
        clearButton.addEventListener('click', () => {
            form.reset();
            selectedSymptomsBar.innerHTML = '';
            document.querySelectorAll('.symptom-item-complex.active, .sub-options-container.active').forEach(el => {
                el.classList.remove('active');
            });
            resultsContainer.innerHTML = '';
        });
    }

    // --- Search/Filter Logic ---
    if(searchInput) {
        searchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            document.querySelectorAll('.symptom-category').forEach(category => {
                let categoryHasMatch = false;
                category.querySelectorAll('.symptom-item-complex').forEach(item => {
                    const label = item.querySelector('.primary-symptom label').textContent.toLowerCase();
                    const isVisible = label.includes(searchTerm);
                    item.style.display = isVisible ? 'block' : 'none';
                    if(isVisible) categoryHasMatch = true;
                });
                const title = category.querySelector('.symptom-category-title');
                if (title) {
                    title.style.display = categoryHasMatch ? 'block' : 'none';
                }
            });
        });
    }

    // --- NEW: ADVANCED FORM SUBMISSION & SCORING LOGIC ---
    if(form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); 
            
            // 1. GATHER INPUTS
            const selectedSymptomKeys = Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(cb => cb.value);
            // In a real app, you would add a form section for risk factors and gather them here.
            // For this example, we'll use a hardcoded object.
            const userRiskFactors = { "age_over_40": true, "is_smoker": true, "family_history_hypertension": true };

            if (selectedSymptomKeys.length === 0) {
                if(resultsContainer) resultsContainer.innerHTML = '<h3>Please select at least one symptom.</h3>';
                return;
            }

            // 2. CHECK FOR RED FLAG SYMPTOMS
            let redFlagTriggered = false;
            let matchedSymptomDetails = []; // Need this for the final results display
            
            selectedSymptomKeys.forEach(selectedKey => {
                for (const category of structuredSymptoms) {
                    const symptom = category.symptoms.find(s => s.key === selectedKey);
                    if (symptom) {
                        matchedSymptomDetails.push({ label: symptom.label, weight: 0 }); // Temporarily add with weight 0
                        if (symptom.criticality >= 5) {
                            resultsContainer.innerHTML = `
                                <div class="doctor-warning" style="text-align:center;">
                                    <h2>Immediate Action Recommended</h2>
                                    <p>The symptom '<strong>${symptom.label}</strong>' can be associated with serious medical conditions.</p>
                                    <p>This tool cannot provide a diagnosis. Please <strong>contact a healthcare professional or emergency services immediately</strong> for guidance.</p>
                                </div>`;
                            redFlagTriggered = true;
                            resultsContainer.scrollIntoView({ behavior: 'smooth' });
                            break;
                        }
                    }
                }
                if (redFlagTriggered) return;
            });

            if (redFlagTriggered) return; // Stop processing if a red flag was found

            // 3. CALCULATE SCORES WITH RISK FACTORS
            let scores = diseaseData.map(disease => {
                let symptomWeight = 0;
                let riskFactorWeight = 0;
                let totalPossibleWeight = 0;

                if (disease.symptom_weights) {
                    disease.symptoms.forEach(symptomKey => {
                        if (disease.symptom_weights[symptomKey]) {
                            totalPossibleWeight += disease.symptom_weights[symptomKey];
                        }
                    });

                    selectedSymptomKeys.forEach(selectedKey => {
                        if (disease.symptom_weights[selectedKey]) {
                            symptomWeight += disease.symptom_weights[selectedKey];
                        }
                    });
                }
                
                if (disease.risk_factors) {
                    for (const factor in userRiskFactors) {
                        if (userRiskFactors[factor] && disease.risk_factors[factor]) {
                            riskFactorWeight += disease.risk_factors[factor];
                        }
                    }
                }

                const baseScore = totalPossibleWeight > 0 ? (symptomWeight / totalPossibleWeight) * 100 : 0;
                const riskBoost = Math.min(riskFactorWeight * 5, 20);
                const finalScore = Math.min(baseScore + riskBoost, 100);

                return { 
                    disease: disease.disease, 
                    score: finalScore, 
                    matchedSymptoms: matchedSymptomDetails, // Use the pre-gathered details
                };
            });

            scores = scores.filter(s => s.score > 10).sort((a, b) => b.score - a.score);
            
            // 4. DISPLAY RESULTS
            if(resultsContainer) {
                displayResults(scores, diseaseData, resultsContainer);
                resultsContainer.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // --- Display Results Function ---
    function displayResults(scores, allDiseaseData, container) {
        if (scores.length === 0) {
            container.innerHTML = '<h3>No Potential Matches Found</h3><p>Based on the selected symptoms, no potential conditions in our database are a strong match. This does not rule out a medical condition. Please consult a healthcare professional.</p>';
            return;
        }

        let resultsToDisplay = [];
        let subtitle = '';

        if (scores[0].score >= 70) {
            resultsToDisplay.push(scores[0]);
            subtitle = `Based on your symptoms, here is a strong potential match to research further and discuss with a healthcare professional:`;
        } else {
            resultsToDisplay = scores.slice(0, 3);
            subtitle = `Here are the top potential matches for you to research further and discuss with a healthcare professional:`;
        }

        let resultsHtml = `<h2 class="results-title">Potential Matches</h2><p class="results-subtitle">${subtitle}</p>`;
        
        resultsToDisplay.forEach((result) => {
            const diseaseInfo = allDiseaseData.find(d => d.disease === result.disease);
            if (!diseaseInfo || !diseaseInfo.suggestions) return;

            const { description, remedies, medication_guidance, common_otc, foodToAvoid, whenToSeeDoctor } = diseaseInfo.suggestions;
            const score = result.score.toFixed(0);

            // Filter matched symptoms for the current disease
            let matchedSymptomsHtml = '<ul>';
            const diseaseSymptoms = diseaseInfo.symptoms;
            result.matchedSymptoms.filter(s => {
                const symptomKey = structuredSymptoms.flatMap(c => c.symptoms).find(sym => sym.label === s.label)?.key;
                return diseaseSymptoms.includes(symptomKey);
            }).forEach(s => {
                matchedSymptomsHtml += `<li><strong>${s.label}</strong></li>`;
            });
            matchedSymptomsHtml += '</ul>';


            resultsHtml += `
                <div class="result-card">
                    <div class="result-header">
                        <h3>${result.disease}</h3>
                        <p><strong>Symptom Match Score:</strong> ${score}%</p>
                        <div class="confidence-bar-container">
                            <div class="confidence-bar-fill" style="width: ${score}%;"></div>
                        </div>
                        <p class="match-info" style="margin-top: 10px;"><em>This score is based on the relevance of your matched symptoms and risk factors.</em></p>
                    </div>
                    <div class="result-body">
                        <h4>Matched Symptoms</h4>
                        ${matchedSymptomsHtml}
                        <p>${description}</p>
                        <h4>Common Self-Care Suggestions</h4>
                        <ul>${remedies.map(r => `<li>${r}</li>`).join('')}</ul>
                        <h4>Medication Guidance</h4>
                        <p class="disclaimer-text">This is not a prescription. <strong>Always consult a doctor or pharmacist before taking any medication.</strong></p>
                        <p>${medication_guidance || 'Please consult a professional.'}</p>
                        <h4>Common Over-the-Counter Options to Discuss with a Professional</h4>
                        <ul>${(common_otc || []).map(d => `<li>${d}</li>`).join('')}</ul>
                        <h4>Foods to Consider Avoiding</h4>
                        <p>${foodToAvoid || 'No specific recommendations.'}</p>
                        <div class="doctor-warning"><strong>When to see a doctor:</strong> ${whenToSeeDoctor}</div>
                    </div>
                </div>`;
        });
        container.innerHTML = resultsHtml;
    }

    // --- Initial Load ---
    populateSymptoms(structuredSymptoms);
});