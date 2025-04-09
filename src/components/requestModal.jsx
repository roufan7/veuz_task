import React, { useEffect, useState } from 'react'
import { IoBanSharp } from 'react-icons/io5'
import { Slider } from '@mui/material';
import dayjs from 'dayjs';
import { Form, Modal } from 'react-bootstrap';

const RequestModal = ({ modalShow, setModalShow, selectedRange }) => {
    const [value, setValue] = useState([0, 0]);
    const [range, setRange] = useState([0, 0])
    const [productivity, setProductivity] = useState('')

    useEffect(() => {
        if (selectedRange?.start && selectedRange?.end) {
            const min = parseTimeToMinutes(selectedRange?.start);
            const max = parseTimeToMinutes(selectedRange?.end);
            setValue([min, max])
            setRange([min, max])
        }
    }, [selectedRange?.start])

    const parseTimeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;

    };

    const formatMinutesToTime = (minutes) => {
        return dayjs().startOf('day').add(minutes, 'minute').format('hh:mm A');
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (
        <Modal show={modalShow} size='lg' onHide={() => setModalShow(false)} centered>
            <Modal.Header closeButton>
                <div className='d-flex align-items-center'>
                    <div className='offline-icon'><IoBanSharp size={22} color='#db5242' />  </div>
                    <span className='offline-head'>Offline Time</span>
                </div>
            </Modal.Header>
            <Modal.Body>

                <div className='d-flex align-items-center justify-content-center'>
                    <div className='time-wrapper'>{formatMinutesToTime(value[0])}</div> -
                    <div className='time-wrapper'>{formatMinutesToTime(value[1])}</div>
                </div>
                <Slider
                    min={range[0]}
                    max={range[1]}
                    className='mt-2'
                    value={value}
                    onChange={handleChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={formatMinutesToTime}
                    sx={{
                        color: '#c9c8c8', 
                        height: '6px',
                        '& .MuiSlider-thumb': {
                            borderRadius: 0,
                            backgroundColor: '#d88833',
                            width: 20,
                            height: 20,
                            '&:hover, &.Mui-focusVisible, &.Mui-active': {
                                boxShadow: 'none', 
                            },
                        },
                        '& .MuiSlider-rail': {
                            color: '#c9c8c8',
                            opacity: 1,
                        },
                        '& .MuiSlider-track': {
                            color: '#c9c8c8',
                        },
                    }}
                />
                <div className='mt-3'>
                    <Form.Control type='text' placeholder='Description' />
                </div>
                <div className='mt-3'>
                    <span className='productivity-head'>Productivity</span>
                    <div className='d-flex align-items-center justify-content-between mt-2'>
                        <div className={`productivity-check productive ${productivity == 'PRODUCTIVE' ? 'selected' : ''}`} onClick={() => setProductivity('PRODUCTIVE')}><Form.Check checked={productivity == 'PRODUCTIVE'} label={'Productive'} /></div>
                        <div className={`productivity-check unproductive ${productivity == 'UNPRODUCTIVE' ? 'selected' : ''}`} onClick={() => setProductivity('UNPRODUCTIVE')}><Form.Check checked={productivity == 'UNPRODUCTIVE'} label={'Unproductive'} /></div>
                        <div className={`productivity-check neutral ${productivity == 'NEUTRAL' ? 'selected' : ''}`} onClick={() => setProductivity('NEUTRAL')}><Form.Check checked={productivity == 'NEUTRAL'} label={'Neutral'} /></div>
                    </div>
                </div>
                <div className='d-flex align-items-center justify-content-center mt-5 gap-3'>
                    <div className='cancel-btn' onClick={() => setModalShow(false)}>Cancel</div>
                    <div className='submit-btn' onClick={() => setModalShow(false)}>Save</div>
                </div>
            </Modal.Body>

        </Modal>
    )
}

export default RequestModal