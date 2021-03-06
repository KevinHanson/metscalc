var React = window.React || require('react')
var ReactDOM = window.ReactDOM || require('react-dom')
var moment = window.moment || require('moment')

const msscalc = require('./msscalc')
const bmi = require('./bmi')

class Calculator extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      age: null,
      sex: '',
      race: '',
      hdl: '',
      sbp: '',
      triglyceride: '',
      glucose: '',
      waist: '',
      waistUnit: 'cm',
      weight: '',
      weightUnit: 'kg',
      height: '',
      heightUnit: 'cm',
      bmiadult: '',
      bmiz: '',
      birth: '',
      appointment: moment().format(moment.HTML5_FMT.DATE),
      result: null
    }

    this.handleBack = this.handleBack.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.afterUpdate = this.afterUpdate.bind(this)
  }

  render () {
    let {
      age, sex, race, weight, weightUnit, height, heightUnit, hdl, sbp, triglyceride,
      glucose, waist, waistUnit, bmiadult, bmiz, birth, appointment, result
    } = this.state

    const adolescent = age && age < 20

    return (
      <form onSubmit={this.handleSubmit}>
        <h3>Age</h3>
        <div className="form-group">
          <label htmlFor="birth">Birthdate <em>(if younger than 20 years old)</em></label>
          <input className="form-control" type="date" name="birth" value={birth} onChange={this.handleChange}></input>
        </div>
        {birth && (
          <div className="form-group">
            <label htmlFor="appointment">Appointment Date</label>
            <input className="form-control" type="date" name="appointment" value={appointment} onChange={this.handleChange}></input>
          </div>
        )}
        {age && (
          <div className="form-group">
            <label htmlFor="age">Age at Appointment (years)</label>
            <input className="form-control" name="age" value={age || ''} readOnly />
          </div>
        )}

        <h3>Demographics</h3>
        <ButtonGroup
          name="sex" label="Sex" value={sex} options={msscalc.Sex}
          onClick={this.handleClick}
        />
        <ButtonGroup
          name="race" label="Race and Ethnicity" value={race} options={{
            'Hispanic': msscalc.RaceEthnicity.Hispanic,
            'Non-Hispanic Black': msscalc.RaceEthnicity.Black,
            'Non-Hispanic White': msscalc.RaceEthnicity.White
          }}
          onClick={this.handleClick}
        />

        <h3>Blood pressure</h3>
        <div className="form-group">
          <label htmlFor="sbp">Systolic Blood Pressure (mmHg)</label>
          <input className="form-control" name="sbp" type="number" min="0" step="any" value={sbp} onChange={this.handleChange}></input>
        </div>
        <div className="form-group">
          <label htmlFor="glucose">Fasting Glucose (mg/dL)</label>
          <input className="form-control" name="glucose" type="number" min="0" step="any" value={glucose} onChange={this.handleChange}></input>
        </div>

        <h3>Measurements</h3>
        <div className="form-group">
          <label htmlFor="triglyceride">Triglycerides (mg/dL)</label>
          <input className="form-control" name="triglyceride" type="number" min="0" step="any" value={triglyceride} onChange={this.handleChange}></input>
        </div>
        <div className="form-group">
          <label htmlFor="hdl"><abbr title="High-density lipoprotein">HDL</abbr> (mg/dL)</label>
          <input className="form-control" name="hdl" type="number" min="0" step="any" value={hdl} onChange={this.handleChange}></input>
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight</label>
          <Measurement name="weight" value={weight} unit={weightUnit}
            onValueChange={this.handleChange} onUnitChange={this.handleChange}
            units={{
              lbs: 'Pounds (lbs)',
              kg: 'Kilograms (kg)'
            }}
          />

          <label htmlFor="height">Height</label>
          <Measurement name="height" value={height} unit={heightUnit}
            onValueChange={this.handleChange} onUnitChange={this.handleChange}
            units={{
              in: 'Inches (in)',
              cm: 'Centimeters (cm)',
              m: 'Meters (m)'
            }}
          />
        </div>
        {!adolescent && (
          <div className="form-group">
            <label htmlFor="waist">Waist Circumference <em>(if available)</em></label>
            <Measurement name="waist" value={waist} unit={waistUnit}
              onValueChange={this.handleChange} onUnitChange={this.handleChange}
              units={{
                in: 'Inches (in)',
                cm: 'Centimeters (cm)',
                m: 'Meters (m)'
              }}
            />
          </div>
        )}

        {bmiadult && (
          <div className="form-group">
            <label htmlFor="bmiadult"> BMI </label>
            <input className="form-control" name="bmiadult" value={bmiadult} readOnly />
          </div>
        )}

        {adolescent && (
          <div className="form-group">
            <label htmlFor="bmiz"> BMI Z-Score </label>
            <input className="form-control" name="bmiz" value={bmiz} readOnly />
          </div>
        )}

        <button type="submit" className="btn btn-primary float-right"
          disabled={
            !(sex && race && sbp && glucose && hdl && triglyceride) ||
            !((weight && height) || waist)
          }
        >
          Calculate
        </button>

        {result && (
          <div className="result">
            <h2>Results</h2>
            {result.mets_z_bmi && (
              <p>Z-Score based on Body Mass Index
                <span className="amount">{result.mets_z_bmi.toFixed(3)}</span>
              </p>
            )}
            {result.mets_z_wc && (
              <p>Z-Score based on Waistline
                <span className="amount">{result.mets_z_wc.toFixed(3)}</span>
              </p>
            )}
          </div>
        )}

      </form>
    )
  }

  handleBack (event) {
    event.preventDefault()
    this.setState({ result: null })
  }

  handleChange (event) {
    this.setState({ [event.target.name]: event.target.value }, this.afterUpdate)
  }

  handleClick (event) {
    let input

    switch (event.target.tagName.toLowerCase()) {
      case 'input':
        input = event.target
        break

      case 'label':
        input = event.target.getElementsByTagName('input')[0]
        break
    }

    if (!input) {
      return
    }

    this.setState({ [input.name]: input.value }, this.afterUpdate)
  }

  handleSubmit (event) {
    event.preventDefault()

    let {
      age, bmiadult, sex, race, hdl, sbp, triglyceride, glucose, waist, waistUnit,
      birth, appointment, bmiz
    } = this.state

    const result = msscalc.CalculateMSS({
      age: age ? moment(appointment).diff(moment(birth), 'years') : 25,
      sex,
      race,
      bmi: bmiadult,
      hdl,
      sbp,
      triglyceride,
      glucose,
      bmiZScore: bmiz,
      waist: centimeters(waist, waistUnit) || null
    })

    this.setState({ result })
  }

  afterUpdate () {
    const { birth, appointment, weight, weightUnit, height, heightUnit, sex } = this.state

    let age = null
    let bmiz = ''
    let bmiadult = ''

    if (birth && appointment) {
      age = moment(appointment).diff(moment(birth), 'years')
    }

    if (height && weight) {
      const weightKG = kilograms(weight, weightUnit)
      const heightMeters = meters(height, heightUnit)

      bmiadult = bmi.BMIAdult(weightKG, heightMeters)

      const adolescent = age && age < 20
      if (adolescent && sex) {
        const agemos = moment(appointment).diff(moment(birth), 'months')
        const sexord = sex === 'MALE' ? bmi.Sex.Male : bmi.Sex.Female
        bmiz = bmi.BMIZscore(weightKG, heightMeters, sexord, agemos)
      }
    }

    this.setState({
      age,
      bmiz,
      bmiadult: bmiadult
    })
  }
}

// meters converts the length from units into meters.
function meters (length, units) {
  if (isNaN(parseFloat(length))) {
    console.error('length must be a number; got:', length)
    return null
  }

  switch (units) {
    case 'm':
      return length

    case 'cm':
      return length / 100

    case 'in':
      // https://www.google.com/search?q=in+to+m
      return length / 39.37
  }

  console.error("units must be 'm', 'cm', or 'in'; got:", units)
  return null
}

function centimeters (length, units) {
  if (isNaN(parseFloat(length))) {
    console.error('length must be a number; got:', length)
    return null
  }

  switch (units) {
    case 'cm':
      return length

    case 'm':
      return length * 100

    case 'in':
      // https://www.google.com/search?q=in+to+cm
      return length * 2.54
  }

  console.error("units must be 'm', 'cm', or 'in'; got:", units)
  return null
}

// kilograms converts the mass from units into kilograms.
function kilograms (mass, units) {
  if (isNaN(parseFloat(mass))) {
    console.error('mass must be a number; got:', mass)
    return null
  }

  switch (units) {
    case 'kg':
      return mass

    case 'lbs':
    // https://www.google.com/search?q=pounds+to+kg
      return mass / 2.205
  }

  console.error("units must be 'kg' or 'lbs'; got:", units)
  return null
}

function ButtonGroup (props) {
  const { name, label, options, value, onClick, onKeyPress } = props

  if (!options || options.length === 0) {
    return null
  }

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <div className="input-group btn-group btn-group-toggle" data-toggle="buttons">
        {Object.keys(options).map(label => (
          <Button key={label}
            group={name} label={label} value={options[label]}
            pressed={value === options[label]}
            onClick={onClick} onKeyPress={onKeyPress}
          />
        ))}
      </div>
    </div>
  )
}

function Button (props) {
  const { group, label, pressed, value, onClick, onKeyPress } = props

  return (
    <label className= {`btn btn-light ${pressed ? 'active' : ''}`}
      role="button"
      checked={pressed}
      aria-pressed={pressed}
      onClick={onClick} onKeyPress={onKeyPress}
    >
      <input type="radio" name={group} value={value} autoComplete="off" /> {label}
    </label>
  )
}

function Measurement (props) {
  const {
    name, unit, units, value, onValueChange, onUnitChange
  } = props

  return (
    <div className="input-group">
      <input className="form-control" name={name} type="number" min="0" step="any" value={value} onChange={onValueChange}></input>
      {units && (
        <div className="input-group-append">
          <select className="custom-select" value={unit} name={`${name}Unit`} onChange={onUnitChange}>
            {Object.keys(units).map(key => (
              <option key={key} value={key}>{units[key]}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

ReactDOM.render(<Calculator />, document.getElementById('calculator'))
