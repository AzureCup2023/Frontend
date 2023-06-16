import styled from "@emotion/styled";

export function Logo(prop: {showFilter: boolean}) {
	const ImgWrapper = styled('img')(
		({ }) => `
			max-width: 100%;
			&.filterShow {
				filter: invert(157%) sepia(79%) saturate(2385%) hue-rotate(86deg) brightness(118%) contrast(99%);
			}
		`
	);
	return <>
		<div style={{ maxWidth: "100%" }}>
			<ImgWrapper className={prop.showFilter ? "filterShow" : ""} src="/static/images/logo/foxplore.svg" />
		</div>
	</>
}
