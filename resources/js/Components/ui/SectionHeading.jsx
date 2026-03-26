export default function SectionHeading({ title, badge, action }) {
    return (
        <div className="section-heading">
            <h2>{title}</h2>
            <div className="section-heading__meta">
                {badge ? <span className="pill pill--accent">{badge}</span> : null}
                {action ? <button className="text-button">{action}</button> : null}
            </div>
        </div>
    );
}
