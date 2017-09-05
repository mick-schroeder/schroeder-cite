'use strict';

const React = require('react');
const ItemBox = require('zotero-web-library/lib/component/item/box');
const { hideFields, noEditFields } = require('zotero-web-library/lib/constants/item');
const { Link } = require('react-router-dom');
const { getItemTypeMeta } = require('../utils');


class Editor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true
		};
	}

	async componentDidMount() {
		this.prepareState(this.props);
	}

	async componentWillReceiveProps(nextProps) {
		if(this.props.location === nextProps.location 
			&& this.props.items === nextProps.items) {
			return;
		}

		this.prepareState(nextProps);
	}

	async prepareState(nextProps) {
		const item = nextProps.items.find(item => item.itemKey === nextProps.match.params.item);
		
		if(!item) {
			this.setState({
				isLoading: true
			});
			return;
		}

		try {
			var { itemTypes, itemTypeFields, itemTypeCreatorTypes } = await getItemTypeMeta(item.itemType);
		} catch(e) {
			this.props.onError('Failed to obtain meta data. Please check your connection and try again.');
			this.setState({
				isLoading: false
			});
			return;
		}

		itemTypes = itemTypes.map(it => ({
			value: it.itemType,
			label: it.localized
		}));

		itemTypeCreatorTypes = itemTypeCreatorTypes.map(ct => ({
			value: ct.creatorType,
			label: ct.localized
		}));

		const fields = [
			{ field: 'itemType', localized: 'Item Type' },
			itemTypeFields.find(itf => itf.field === 'title'),
			{ field: 'creators', localized: 'Creators' },
			...itemTypeFields.filter(itf => itf.field !== 'title')
		]
			.filter(f => f && !hideFields.filter(f => f != 'abstractNote').includes(f.field))
			.map(f => ({
				options: f.field === 'itemType' ? itemTypes : null,
				key: f.field,
				label: f.localized,
				readonly: noEditFields.includes(f.field),
				processing: false,
				value: f.field in item ? item[f.field] : null
		}));

		this.setState({
			item,
			fields,
			creatorTypes: itemTypeCreatorTypes,
			isLoading: false
		});
	}

	async handleItemUpdate(key, newValue) {
		let fieldIndex = this.state.fields.findIndex(field => field.key == key);
		this.setState({
			fields: [
				...this.state.fields.slice(0, fieldIndex),
				{
					...this.state.fields[fieldIndex],
					processing: true,
					value: newValue
				},
				...this.state.fields.slice(fieldIndex + 1)
			]
		}, () => {
			this.props.onItemUpdate(this.state.item.itemKey, key, newValue);
		});
	}

	render() {
		return (
			<div className="item-box-container">
				<Link to="/">Back</Link>
				<ItemBox 
					{ ...this.state }
					onSave={ this.handleItemUpdate.bind(this) } />
			</div>
		);
	}
}

module.exports = Editor;
