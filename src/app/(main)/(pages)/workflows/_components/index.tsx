import React from 'react'
import WorkflowCard from './workFlow-card'

type Props = {}

const Workflows = (props: Props) => {
    return (
        <div className="relative flex flex-col gap-4">
            <section className="flex flex-col m-2">
                <WorkflowCard description='Creating a test workflow' id="4425fd5r"
                name="Automation workflow test" publish={false}/>
            </section>

        </div>
    )
}

export default Workflows